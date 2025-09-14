const { Op } = require('sequelize')
const { EmergencyContact, SOSAlert, Reminder } = require('../models')
const { AppError, formatResponse, formatPaginatedResponse, getPaginationParams, buildPaginationMeta } = require('../utils/helpers')
const { publishMessage } = require('../config/rabbitmq')

class EmergencyService {
  // Emergency Contacts
  async createEmergencyContact(userId, contactData) {
    // If this is set as primary, unset other primary contacts
    if (contactData.isPrimary) {
      await EmergencyContact.update(
        { isPrimary: false },
        { where: { userId, isPrimary: true } }
      )
    }

    const contact = await EmergencyContact.create({
      ...contactData,
      userId
    })

    return contact
  }

  async getEmergencyContacts(userId, pagination) {
    const { limit, offset } = pagination
    
    const { count, rows } = await EmergencyContact.findAndCountAll({
      where: { userId, isActive: true },
      order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      contacts: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateEmergencyContact(userId, contactId, updateData) {
    const contact = await EmergencyContact.findOne({
      where: { id: contactId, userId }
    })

    if (!contact) {
      throw new AppError('Emergency contact not found', 404)
    }

    // If setting as primary, unset other primary contacts
    if (updateData.isPrimary) {
      await EmergencyContact.update(
        { isPrimary: false },
        { where: { userId, isPrimary: true, id: { [Op.ne]: contactId } } }
      )
    }

    await contact.update(updateData)
    return contact
  }

  async deleteEmergencyContact(userId, contactId) {
    const contact = await EmergencyContact.findOne({
      where: { id: contactId, userId }
    })

    if (!contact) {
      throw new AppError('Emergency contact not found', 404)
    }

    await contact.update({ isActive: false })
    return { message: 'Emergency contact deleted successfully' }
  }

  // SOS Alerts
  async createSOSAlert(userId, alertData) {
    const alert = await SOSAlert.create({
      ...alertData,
      userId
    })

    // Notify emergency contacts and emergency services
    await this.notifyEmergencyContacts(userId, alert)
    
    // Publish to message queue for emergency response
    await publishMessage('notifications.emergency', {
      type: 'sos_alert',
      userId,
      alertId: alert.id,
      location: {
        latitude: alert.latitude,
        longitude: alert.longitude,
        address: alert.address
      },
      priority: alert.priority,
      timestamp: alert.createdAt
    })

    return alert
  }

  async getSOSAlerts(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    const { count, rows } = await SOSAlert.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      alerts: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateSOSAlert(userId, alertId, updateData) {
    const alert = await SOSAlert.findOne({
      where: { id: alertId, userId }
    })

    if (!alert) {
      throw new AppError('SOS alert not found', 404)
    }

    // Set response/resolved time based on status change
    if (updateData.status === 'resolved' && !alert.resolvedAt) {
      updateData.resolvedAt = new Date()
    }

    await alert.update(updateData)
    return alert
  }

  async notifyEmergencyContacts(userId, alert) {
    const contacts = await EmergencyContact.findAll({
      where: { userId, isActive: true },
      order: [['isPrimary', 'DESC']]
    })

    // Send notifications to emergency contacts
    for (const contact of contacts) {
      await publishMessage('notifications.emergency_contact', {
        type: 'sos_notification',
        contactPhone: contact.phone,
        contactEmail: contact.email,
        message: `Emergency alert from your contact. Location: ${alert.address || 'Location not available'}`,
        alertDetails: alert
      })
    }
  }

  // Reminders
  async createReminder(userId, reminderData) {
    const reminder = await Reminder.create({
      ...reminderData,
      userId
    })

    // Schedule reminder notification
    await this.scheduleReminderNotification(reminder)

    return reminder
  }

  async getReminders(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.status) {
      where.status = filters.status
    } else {
      where.status = { [Op.ne]: 'cancelled' }
    }

    const { count, rows } = await Reminder.findAndCountAll({
      where,
      order: [['scheduledAt', 'ASC']],
      limit,
      offset
    })

    return {
      reminders: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateReminder(userId, reminderId, updateData) {
    const reminder = await Reminder.findOne({
      where: { id: reminderId, userId }
    })

    if (!reminder) {
      throw new AppError('Reminder not found', 404)
    }

    // Update completion time if status changed to completed
    if (updateData.status === 'completed' && !reminder.completedAt) {
      updateData.completedAt = new Date()
    }

    await reminder.update(updateData)

    // Reschedule if time changed
    if (updateData.scheduledAt) {
      await this.scheduleReminderNotification(reminder)
    }

    return reminder
  }

  async deleteReminder(userId, reminderId) {
    const reminder = await Reminder.findOne({
      where: { id: reminderId, userId }
    })

    if (!reminder) {
      throw new AppError('Reminder not found', 404)
    }

    await reminder.update({ status: 'cancelled' })
    return { message: 'Reminder cancelled successfully' }
  }

  async snoozeReminder(userId, reminderId, snoozeMinutes = 15) {
    const reminder = await Reminder.findOne({
      where: { id: reminderId, userId }
    })

    if (!reminder) {
      throw new AppError('Reminder not found', 404)
    }

    const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000)
    await reminder.update({ snoozeUntil })

    return reminder
  }

  async scheduleReminderNotification(reminder) {
    await publishMessage('reminders.schedule', {
      type: 'schedule_reminder',
      reminderId: reminder.id,
      userId: reminder.userId,
      scheduledAt: reminder.scheduledAt,
      title: reminder.title,
      description: reminder.description,
      notificationMethods: reminder.notificationMethods,
      isRecurring: reminder.isRecurring,
      frequency: reminder.frequency
    })
  }
}

module.exports = new EmergencyService()