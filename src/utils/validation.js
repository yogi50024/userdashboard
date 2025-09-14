const { body, param, query } = require('express-validator')

const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required and must be less than 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required and must be less than 50 characters'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ]
}

const emergencyValidation = {
  createContact: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required and must be less than 100 characters'),
    body('relationship')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Relationship is required'),
    body('phone')
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('isPrimary')
      .optional()
      .isBoolean()
      .withMessage('isPrimary must be a boolean')
  ],

  createSOS: [
    body('latitude')
      .optional()
      .isDecimal()
      .withMessage('Latitude must be a valid decimal'),
    body('longitude')
      .optional()
      .isDecimal()
      .withMessage('Longitude must be a valid decimal'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Message must be less than 500 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Priority must be one of: low, medium, high, critical')
  ],

  createReminder: [
    body('type')
      .isIn(['medication', 'appointment', 'custom'])
      .withMessage('Type must be one of: medication, appointment, custom'),
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title is required and must be less than 200 characters'),
    body('scheduledAt')
      .isISO8601()
      .withMessage('Please provide a valid date and time'),
    body('frequency')
      .optional()
      .isIn(['once', 'daily', 'weekly', 'monthly'])
      .withMessage('Frequency must be one of: once, daily, weekly, monthly')
  ]
}

const medicalValidation = {
  createAppointment: [
    body('doctorId')
      .isUUID()
      .withMessage('Please provide a valid doctor ID'),
    body('appointmentDate')
      .isISO8601()
      .withMessage('Please provide a valid appointment date'),
    body('appointmentType')
      .isIn(['in-person', 'online', 'phone'])
      .withMessage('Appointment type must be one of: in-person, online, phone'),
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters')
  ],

  bookLab: [
    body('testIds')
      .isArray({ min: 1 })
      .withMessage('At least one test must be selected'),
    body('scheduledDate')
      .isISO8601()
      .withMessage('Please provide a valid scheduled date'),
    body('timeSlot')
      .notEmpty()
      .withMessage('Time slot is required'),
    body('bookingType')
      .isIn(['home-collection', 'lab-visit'])
      .withMessage('Booking type must be home-collection or lab-visit')
  ]
}

const homeServiceValidation = {
  bookService: [
    body('serviceId')
      .isUUID()
      .withMessage('Please provide a valid service ID'),
    body('scheduledDate')
      .isISO8601()
      .withMessage('Please provide a valid scheduled date'),
    body('startTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Please provide a valid start time (HH:MM)'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be at least 1 hour'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
  ]
}

const supportValidation = {
  createDispute: [
    body('category')
      .isIn(['billing', 'service-quality', 'appointment', 'prescription', 'technical', 'other'])
      .withMessage('Invalid category'),
    body('subject')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject is required and must be less than 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long')
  ],

  createTicket: [
    body('category')
      .isIn(['technical', 'account', 'billing', 'feature-request', 'general'])
      .withMessage('Invalid category'),
    body('subject')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Subject is required and must be less than 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long')
  ]
}

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
]

const uuidValidation = (paramName = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`)
]

module.exports = {
  authValidation,
  emergencyValidation,
  medicalValidation,
  homeServiceValidation,
  supportValidation,
  paginationValidation,
  uuidValidation
}