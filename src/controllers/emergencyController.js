const emergencyService = require('../services/emergencyService')
const { formatResponse, formatPaginatedResponse, getPaginationParams } = require('../utils/helpers')

class EmergencyController {
  // Emergency Contacts
  async createEmergencyContact(req, res) {
    const contact = await emergencyService.createEmergencyContact(req.user.id, req.body)
    res.status(201).json(formatResponse(contact, 'Emergency contact created successfully'))
  }

  async getEmergencyContacts(req, res) {
    const pagination = getPaginationParams(req)
    const result = await emergencyService.getEmergencyContacts(req.user.id, pagination)
    res.json(formatPaginatedResponse(result.contacts, result.pagination, 'Emergency contacts retrieved successfully'))
  }

  async updateEmergencyContact(req, res) {
    const contact = await emergencyService.updateEmergencyContact(req.user.id, req.params.id, req.body)
    res.json(formatResponse(contact, 'Emergency contact updated successfully'))
  }

  async deleteEmergencyContact(req, res) {
    const result = await emergencyService.deleteEmergencyContact(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  // SOS Alerts
  async createSOSAlert(req, res) {
    const alert = await emergencyService.createSOSAlert(req.user.id, req.body)
    res.status(201).json(formatResponse(alert, 'SOS alert created successfully'))
  }

  async getSOSAlerts(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status
    }
    const result = await emergencyService.getSOSAlerts(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.alerts, result.pagination, 'SOS alerts retrieved successfully'))
  }

  async updateSOSAlert(req, res) {
    const alert = await emergencyService.updateSOSAlert(req.user.id, req.params.id, req.body)
    res.json(formatResponse(alert, 'SOS alert updated successfully'))
  }

  // Reminders
  async createReminder(req, res) {
    const reminder = await emergencyService.createReminder(req.user.id, req.body)
    res.status(201).json(formatResponse(reminder, 'Reminder created successfully'))
  }

  async getReminders(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      type: req.query.type,
      status: req.query.status
    }
    const result = await emergencyService.getReminders(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.reminders, result.pagination, 'Reminders retrieved successfully'))
  }

  async updateReminder(req, res) {
    const reminder = await emergencyService.updateReminder(req.user.id, req.params.id, req.body)
    res.json(formatResponse(reminder, 'Reminder updated successfully'))
  }

  async deleteReminder(req, res) {
    const result = await emergencyService.deleteReminder(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  async snoozeReminder(req, res) {
    const { minutes = 15 } = req.body
    const reminder = await emergencyService.snoozeReminder(req.user.id, req.params.id, minutes)
    res.json(formatResponse(reminder, 'Reminder snoozed successfully'))
  }
}

module.exports = new EmergencyController()