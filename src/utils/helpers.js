const jwt = require('jsonwebtoken')
const crypto = require('crypto')

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  )

  return { accessToken, refreshToken }
}

const generateRandomCode = (length = 6) => {
  return crypto.randomInt(100000, 999999).toString()
}

const generateTicketNumber = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `TKT-${timestamp}-${random}`.toUpperCase()
}

const formatResponse = (data, message = 'Success', success = true) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}

const formatPaginatedResponse = (data, pagination, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  }
}

const calculateAge = (dateOfBirth) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

const sanitizeUser = (user) => {
  if (!user) return null
  
  const userObj = typeof user.toJSON === 'function' ? user.toJSON() : user
  const { password, ...sanitizedUser } = userObj
  return sanitizedUser
}

const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1
  const limit = Math.min(parseInt(req.query.limit) || 10, 100) // Max 100 items per page
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit)
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

module.exports = {
  AppError,
  generateTokens,
  generateRandomCode,
  generateTicketNumber,
  formatResponse,
  formatPaginatedResponse,
  calculateAge,
  sanitizeUser,
  getPaginationParams,
  buildPaginationMeta
}