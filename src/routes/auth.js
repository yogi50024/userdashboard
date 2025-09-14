const express = require('express')
const authController = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { authValidation } = require('../utils/validation')

const router = express.Router()

// Public routes
router.post('/register', authValidation.register, handleValidationErrors, authController.register)
router.post('/login', authValidation.login, handleValidationErrors, authController.login)
router.post('/refresh-token', authValidation.refreshToken, handleValidationErrors, authController.refreshToken)
router.post('/forgot-password', authValidation.forgotPassword, handleValidationErrors, authController.forgotPassword)
router.post('/reset-password', authValidation.resetPassword, handleValidationErrors, authController.resetPassword)

// Protected routes
router.use(authenticateToken)
router.post('/logout', authController.logout)
router.post('/change-password', authValidation.changePassword, handleValidationErrors, authController.changePassword)
router.get('/profile', authController.getProfile)

module.exports = router