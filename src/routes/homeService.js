const express = require('express')
const homeServiceController = require('../controllers/homeServiceController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { homeServiceValidation, paginationValidation, uuidValidation } = require('../utils/validation')

const router = express.Router()

// Public routes (no authentication required)
router.get('/services', paginationValidation, handleValidationErrors, homeServiceController.getHomeServices)
router.get('/services/:id', uuidValidation('id'), handleValidationErrors, homeServiceController.getHomeServiceById)
router.get('/providers', paginationValidation, handleValidationErrors, homeServiceController.getServiceProviders)
router.get('/providers/:id', uuidValidation('id'), handleValidationErrors, homeServiceController.getServiceProviderById)

// Protected routes (authentication required)
router.use(authenticateToken)

// Home Service Bookings
router.post('/bookings', homeServiceValidation.bookService, handleValidationErrors, homeServiceController.bookHomeService)
router.get('/bookings', paginationValidation, handleValidationErrors, homeServiceController.getHomeServiceBookings)
router.put('/bookings/:id', uuidValidation('id'), handleValidationErrors, homeServiceController.updateHomeServiceBooking)
router.delete('/bookings/:id', uuidValidation('id'), handleValidationErrors, homeServiceController.cancelHomeServiceBooking)
router.post('/bookings/:id/rate', uuidValidation('id'), handleValidationErrors, homeServiceController.rateServiceProvider)

// Assistance Requests
router.post('/assistance', handleValidationErrors, homeServiceController.createAssistanceRequest)
router.get('/assistance', paginationValidation, handleValidationErrors, homeServiceController.getAssistanceRequests)
router.put('/assistance/:id', uuidValidation('id'), handleValidationErrors, homeServiceController.updateAssistanceRequest)
router.delete('/assistance/:id', uuidValidation('id'), handleValidationErrors, homeServiceController.deleteAssistanceRequest)

module.exports = router