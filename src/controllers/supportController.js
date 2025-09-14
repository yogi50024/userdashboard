const supportService = require('../services/supportService')
const { formatResponse, formatPaginatedResponse, getPaginationParams } = require('../utils/helpers')

class SupportController {
  // Dispute Management
  async createDispute(req, res) {
    const dispute = await supportService.createDispute(req.user.id, req.body)
    res.status(201).json(formatResponse(dispute, 'Dispute created successfully'))
  }

  async getDisputes(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority
    }
    const result = await supportService.getDisputes(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.disputes, result.pagination, 'Disputes retrieved successfully'))
  }

  async getDisputeById(req, res) {
    const dispute = await supportService.getDisputeById(req.user.id, req.params.id)
    res.json(formatResponse(dispute, 'Dispute details retrieved successfully'))
  }

  async updateDispute(req, res) {
    const dispute = await supportService.updateDispute(req.user.id, req.params.id, req.body)
    res.json(formatResponse(dispute, 'Dispute updated successfully'))
  }

  async addDisputeFeedback(req, res) {
    const { feedback, rating } = req.body
    const result = await supportService.addDisputeFeedback(req.user.id, req.params.id, feedback, rating)
    res.json(formatResponse(result))
  }

  // Support Ticket Management
  async createSupportTicket(req, res) {
    const ticket = await supportService.createSupportTicket(req.user.id, req.body)
    res.status(201).json(formatResponse(ticket, 'Support ticket created successfully'))
  }

  async getSupportTickets(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority
    }
    const result = await supportService.getSupportTickets(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.tickets, result.pagination, 'Support tickets retrieved successfully'))
  }

  async getSupportTicketById(req, res) {
    const ticket = await supportService.getSupportTicketById(req.user.id, req.params.id)
    res.json(formatResponse(ticket, 'Support ticket details retrieved successfully'))
  }

  async addTicketMessage(req, res) {
    const message = await supportService.addTicketMessage(req.user.id, req.params.id, req.body)
    res.status(201).json(formatResponse(message, 'Message added successfully'))
  }

  async closeTicket(req, res) {
    const result = await supportService.closeTicket(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  // FAQ Management (Public endpoints)
  async getFAQs(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      category: req.query.category,
      search: req.query.search
    }
    const result = await supportService.getFAQs(pagination, filters)
    res.json(formatPaginatedResponse(result.faqs, result.pagination, 'FAQs retrieved successfully'))
  }

  async getFAQById(req, res) {
    const faq = await supportService.getFAQById(req.params.id)
    res.json(formatResponse(faq, 'FAQ details retrieved successfully'))
  }

  async markFAQHelpful(req, res) {
    const result = await supportService.markFAQHelpful(req.params.id)
    res.json(formatResponse(result))
  }

  async getFAQCategories(req, res) {
    const categories = await supportService.getFAQCategories()
    res.json(formatResponse(categories, 'FAQ categories retrieved successfully'))
  }

  // Search
  async searchSupport(req, res) {
    const { query } = req.query
    if (!query) {
      return res.status(400).json(formatResponse(null, 'Search query is required', false))
    }

    const pagination = getPaginationParams(req)
    const result = await supportService.searchSupport(query, pagination)
    res.json(formatResponse(result, 'Search results retrieved successfully'))
  }

  // User Support Statistics
  async getUserSupportStats(req, res) {
    const stats = await supportService.getUserSupportStats(req.user.id)
    res.json(formatResponse(stats, 'Support statistics retrieved successfully'))
  }
}

module.exports = new SupportController()