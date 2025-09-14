const express = require('express')
const supportController = require('../controllers/supportController')
const { authenticateToken, optionalAuth } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { supportValidation, paginationValidation, uuidValidation } = require('../utils/validation')

const router = express.Router()

// Public routes (no authentication required)
router.get('/faqs', paginationValidation, handleValidationErrors, supportController.getFAQs)
router.get('/faqs/categories', supportController.getFAQCategories)
router.get('/faqs/:id', uuidValidation('id'), handleValidationErrors, supportController.getFAQById)
router.post('/faqs/:id/helpful', uuidValidation('id'), handleValidationErrors, supportController.markFAQHelpful)
router.get('/search', paginationValidation, handleValidationErrors, supportController.searchSupport)

// Protected routes (authentication required)
router.use(authenticateToken)

// Dispute Management
router.post('/disputes', supportValidation.createDispute, handleValidationErrors, supportController.createDispute)
router.get('/disputes', paginationValidation, handleValidationErrors, supportController.getDisputes)
router.get('/disputes/:id', uuidValidation('id'), handleValidationErrors, supportController.getDisputeById)
router.put('/disputes/:id', uuidValidation('id'), handleValidationErrors, supportController.updateDispute)
router.post('/disputes/:id/feedback', uuidValidation('id'), handleValidationErrors, supportController.addDisputeFeedback)

// Support Ticket Management
router.post('/tickets', supportValidation.createTicket, handleValidationErrors, supportController.createSupportTicket)
router.get('/tickets', paginationValidation, handleValidationErrors, supportController.getSupportTickets)
router.get('/tickets/:id', uuidValidation('id'), handleValidationErrors, supportController.getSupportTicketById)
router.post('/tickets/:id/messages', uuidValidation('id'), handleValidationErrors, supportController.addTicketMessage)
router.post('/tickets/:id/close', uuidValidation('id'), handleValidationErrors, supportController.closeTicket)

// User Support Statistics
router.get('/stats', supportController.getUserSupportStats)

module.exports = router