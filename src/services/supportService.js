const { Op } = require('sequelize')
const { Dispute, SupportTicket, TicketMessage, FAQ } = require('../models')
const { AppError, formatResponse, formatPaginatedResponse, getPaginationParams, buildPaginationMeta, generateTicketNumber } = require('../utils/helpers')
const { publishMessage } = require('../config/rabbitmq')

class SupportService {
  // Dispute Management
  async createDispute(userId, disputeData) {
    const dispute = await Dispute.create({
      ...disputeData,
      userId
    })

    // Notify support team
    await publishMessage('notifications.support', {
      type: 'new_dispute',
      disputeId: dispute.id,
      userId,
      priority: dispute.priority,
      category: dispute.category
    })

    return dispute
  }

  async getDisputes(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    const { count, rows } = await Dispute.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      disputes: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getDisputeById(userId, disputeId) {
    const dispute = await Dispute.findOne({
      where: { id: disputeId, userId }
    })

    if (!dispute) {
      throw new AppError('Dispute not found', 404)
    }

    return dispute
  }

  async updateDispute(userId, disputeId, updateData) {
    const dispute = await Dispute.findOne({
      where: { id: disputeId, userId }
    })

    if (!dispute) {
      throw new AppError('Dispute not found', 404)
    }

    // Don't allow updating resolved or closed disputes
    if (['resolved', 'closed'].includes(dispute.status)) {
      throw new AppError('Cannot update resolved or closed dispute', 400)
    }

    await dispute.update(updateData)
    return dispute
  }

  async addDisputeFeedback(userId, disputeId, feedback, rating) {
    const dispute = await Dispute.findOne({
      where: { id: disputeId, userId, status: 'resolved' }
    })

    if (!dispute) {
      throw new AppError('Resolved dispute not found', 404)
    }

    if (dispute.feedback) {
      throw new AppError('Feedback already provided', 400)
    }

    await dispute.update({ feedback, rating })
    return { message: 'Feedback submitted successfully' }
  }

  // Support Ticket Management
  async createSupportTicket(userId, ticketData) {
    const ticketNumber = generateTicketNumber()

    const ticket = await SupportTicket.create({
      ...ticketData,
      userId,
      ticketNumber
    })

    // Create initial message
    await TicketMessage.create({
      ticketId: ticket.id,
      senderId: userId,
      senderType: 'user',
      message: ticketData.description
    })

    // Notify support team
    await publishMessage('notifications.support', {
      type: 'new_ticket',
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      userId,
      priority: ticket.priority,
      category: ticket.category
    })

    return ticket
  }

  async getSupportTickets(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.priority) {
      where.priority = filters.priority
    }

    const { count, rows } = await SupportTicket.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      tickets: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getSupportTicketById(userId, ticketId) {
    const ticket = await SupportTicket.findOne({
      where: { id: ticketId, userId },
      include: [
        {
          model: TicketMessage,
          as: 'messages',
          where: { isInternal: false },
          required: false,
          order: [['createdAt', 'ASC']]
        }
      ]
    })

    if (!ticket) {
      throw new AppError('Support ticket not found', 404)
    }

    return ticket
  }

  async addTicketMessage(userId, ticketId, messageData) {
    const ticket = await SupportTicket.findOne({
      where: { id: ticketId, userId }
    })

    if (!ticket) {
      throw new AppError('Support ticket not found', 404)
    }

    if (['resolved', 'closed'].includes(ticket.status)) {
      throw new AppError('Cannot add message to resolved or closed ticket', 400)
    }

    const message = await TicketMessage.create({
      ticketId,
      senderId: userId,
      senderType: 'user',
      message: messageData.message,
      attachments: messageData.attachments || []
    })

    // Update ticket status and last response time
    await ticket.update({
      status: ticket.status === 'waiting-customer' ? 'open' : ticket.status,
      lastResponseAt: new Date()
    })

    // Notify support team
    await publishMessage('notifications.support', {
      type: 'ticket_message',
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      userId,
      messageId: message.id
    })

    return message
  }

  async closeTicket(userId, ticketId) {
    const ticket = await SupportTicket.findOne({
      where: { id: ticketId, userId }
    })

    if (!ticket) {
      throw new AppError('Support ticket not found', 404)
    }

    if (ticket.status === 'closed') {
      throw new AppError('Ticket is already closed', 400)
    }

    await ticket.update({
      status: 'closed',
      closedAt: new Date()
    })

    return { message: 'Ticket closed successfully' }
  }

  // FAQ Management
  async getFAQs(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.category) {
      where.category = { [Op.iLike]: `%${filters.category}%` }
    }

    if (filters.search) {
      where[Op.or] = [
        { question: { [Op.iLike]: `%${filters.search}%` } },
        { answer: { [Op.iLike]: `%${filters.search}%` } }
      ]
    }

    const { count, rows } = await FAQ.findAndCountAll({
      where,
      order: [['order', 'ASC'], ['viewCount', 'DESC']],
      limit,
      offset
    })

    return {
      faqs: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getFAQById(faqId) {
    const faq = await FAQ.findByPk(faqId)

    if (!faq || !faq.isActive) {
      throw new AppError('FAQ not found', 404)
    }

    // Increment view count
    await faq.increment('viewCount')

    return faq
  }

  async markFAQHelpful(faqId) {
    const faq = await FAQ.findByPk(faqId)

    if (!faq || !faq.isActive) {
      throw new AppError('FAQ not found', 404)
    }

    await faq.increment('helpfulCount')
    return { message: 'Thank you for your feedback' }
  }

  async getFAQCategories() {
    const categories = await FAQ.findAll({
      attributes: ['category'],
      where: { isActive: true },
      group: ['category'],
      order: [['category', 'ASC']]
    })

    return categories.map(item => item.category)
  }

  // Search across all support content
  async searchSupport(query, pagination) {
    const { limit, offset } = pagination

    // Search in FAQs
    const faqResults = await FAQ.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { question: { [Op.iLike]: `%${query}%` } },
          { answer: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['helpfulCount', 'DESC'], ['viewCount', 'DESC']],
      limit: Math.floor(limit / 2) // Split results between FAQs and other content
    })

    return {
      faqs: faqResults,
      totalResults: faqResults.length
    }
  }

  // Get support statistics for user
  async getUserSupportStats(userId) {
    const [totalTickets, openTickets, totalDisputes, openDisputes] = await Promise.all([
      SupportTicket.count({ where: { userId } }),
      SupportTicket.count({ where: { userId, status: { [Op.in]: ['open', 'assigned', 'in-progress'] } } }),
      Dispute.count({ where: { userId } }),
      Dispute.count({ where: { userId, status: { [Op.in]: ['open', 'assigned', 'in-progress'] } } })
    ])

    return {
      tickets: {
        total: totalTickets,
        open: openTickets
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes
      }
    }
  }
}

module.exports = new SupportService()