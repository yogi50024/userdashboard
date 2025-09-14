const express = require('express')

// Import route modules
const authRoutes = require('./auth')
const userRoutes = require('./user')
const emergencyRoutes = require('./emergency')
const medicalRoutes = require('./medical')
const homeServiceRoutes = require('./homeService')
const wellnessRoutes = require('./wellness')
const familyRoutes = require('./family')
const supportRoutes = require('./support')

const router = express.Router()

// API Routes
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/emergency', emergencyRoutes)
router.use('/medical', medicalRoutes)
router.use('/home-services', homeServiceRoutes)
router.use('/wellness', wellnessRoutes)
router.use('/family', familyRoutes)
router.use('/support', supportRoutes)

// Health check for the API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Authentication & Authorization',
      'Emergency Services (SOS, Contacts, Reminders)',
      'Medical Services (Appointments, Lab Tests, Prescriptions)',
      'Home Services (House Help, Companionship)',
      'Health & Wellness (Diet, Exercise, Yoga)',
      'Family Management (Members, Medical History, Permissions)',
      'User Support (Disputes, Tickets, FAQ)'
    ]
  })
})

module.exports = router