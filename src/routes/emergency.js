const express = require('express')
const emergencyController = require('../controllers/emergencyController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { emergencyValidation, paginationValidation, uuidValidation } = require('../utils/validation')

const router = express.Router()

// All emergency routes require authentication
router.use(authenticateToken)

// Emergency Contacts
router.post('/contacts', emergencyValidation.createContact, handleValidationErrors, emergencyController.createEmergencyContact)
router.get('/contacts', paginationValidation, handleValidationErrors, emergencyController.getEmergencyContacts)
router.put('/contacts/:id', uuidValidation('id'), emergencyValidation.createContact, handleValidationErrors, emergencyController.updateEmergencyContact)
router.delete('/contacts/:id', uuidValidation('id'), handleValidationErrors, emergencyController.deleteEmergencyContact)

// SOS Alerts
router.post('/sos', emergencyValidation.createSOS, handleValidationErrors, emergencyController.createSOSAlert)
router.get('/sos', paginationValidation, handleValidationErrors, emergencyController.getSOSAlerts)
router.put('/sos/:id', uuidValidation('id'), handleValidationErrors, emergencyController.updateSOSAlert)

// Reminders
router.post('/reminders', emergencyValidation.createReminder, handleValidationErrors, emergencyController.createReminder)
router.get('/reminders', paginationValidation, handleValidationErrors, emergencyController.getReminders)
router.put('/reminders/:id', uuidValidation('id'), handleValidationErrors, emergencyController.updateReminder)
router.delete('/reminders/:id', uuidValidation('id'), handleValidationErrors, emergencyController.deleteReminder)
router.post('/reminders/:id/snooze', uuidValidation('id'), handleValidationErrors, emergencyController.snoozeReminder)

module.exports = router