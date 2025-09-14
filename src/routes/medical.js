const express = require('express')
const medicalController = require('../controllers/medicalController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { medicalValidation, paginationValidation, uuidValidation } = require('../utils/validation')

const router = express.Router()

// Public routes (no authentication required)
router.get('/doctors', paginationValidation, handleValidationErrors, medicalController.getDoctors)
router.get('/doctors/:id', uuidValidation('id'), handleValidationErrors, medicalController.getDoctorById)
router.get('/lab-tests', paginationValidation, handleValidationErrors, medicalController.getLabTests)
router.get('/pharmacies', paginationValidation, handleValidationErrors, medicalController.getPharmacies)
router.get('/vaccinations', paginationValidation, handleValidationErrors, medicalController.getVaccinations)

// Protected routes (authentication required)
router.use(authenticateToken)

// Appointments
router.post('/appointments', medicalValidation.createAppointment, handleValidationErrors, medicalController.createAppointment)
router.get('/appointments', paginationValidation, handleValidationErrors, medicalController.getAppointments)
router.put('/appointments/:id', uuidValidation('id'), handleValidationErrors, medicalController.updateAppointment)
router.delete('/appointments/:id', uuidValidation('id'), handleValidationErrors, medicalController.cancelAppointment)

// Lab Services
router.post('/lab-bookings', medicalValidation.bookLab, handleValidationErrors, medicalController.bookLabTest)
router.get('/lab-bookings', paginationValidation, handleValidationErrors, medicalController.getLabBookings)

// Virtual Queue
router.post('/queue', handleValidationErrors, medicalController.joinVirtualQueue)
router.get('/queue/:id', uuidValidation('id'), handleValidationErrors, medicalController.getQueueStatus)

// Prescriptions
router.post('/prescriptions', handleValidationErrors, medicalController.orderPrescription)
router.get('/prescriptions', paginationValidation, handleValidationErrors, medicalController.getPrescriptionOrders)

// Patient Transfer
router.post('/transfers', handleValidationErrors, medicalController.requestPatientTransfer)
router.get('/transfers', paginationValidation, handleValidationErrors, medicalController.getPatientTransfers)

// Vaccinations
router.post('/vaccination-bookings', handleValidationErrors, medicalController.bookVaccination)
router.get('/vaccination-bookings', paginationValidation, handleValidationErrors, medicalController.getVaccinationBookings)

module.exports = router