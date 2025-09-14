const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { User } = require('../models')
const { AppError, generateTokens, sanitizeUser } = require('../utils/helpers')
const redisClient = require('../config/redis')

class AuthService {
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new AppError('User with this email already exists', 400)
    }

    // Create user
    const user = await User.create(userData)
    
    // Generate tokens
    const tokens = generateTokens(user.id)
    
    // Store refresh token in Redis (optional)
    await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken)

    return {
      user: sanitizeUser(user),
      tokens
    }
  }

  async login(email, password) {
    // Find user
    const user = await User.findOne({
      where: { email, isActive: true }
    })

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401)
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() })

    // Generate tokens
    const tokens = generateTokens(user.id)
    
    // Store refresh token in Redis
    await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken)

    return {
      user: sanitizeUser(user),
      tokens
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      
      // Check if refresh token exists in Redis
      const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`)
      if (storedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401)
      }

      // Find user
      const user = await User.findByPk(decoded.userId)
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401)
      }

      // Generate new tokens
      const tokens = generateTokens(user.id)
      
      // Update refresh token in Redis
      await redisClient.setEx(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, tokens.refreshToken)

      return {
        user: sanitizeUser(user),
        tokens
      }
    } catch (error) {
      throw new AppError('Invalid refresh token', 401)
    }
  }

  async logout(userId) {
    // Remove refresh token from Redis
    await redisClient.del(`refresh_token:${userId}`)
    
    return { message: 'Logged out successfully' }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400)
    }

    // Update password
    await user.update({ password: newPassword })

    // Invalidate all refresh tokens for security
    await redisClient.del(`refresh_token:${userId}`)

    return { message: 'Password changed successfully' }
  }

  async forgotPassword(email) {
    const user = await User.findOne({
      where: { email, isActive: true }
    })

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store reset token in Redis
    await redisClient.setEx(`reset_token:${resetToken}`, 15 * 60, user.id)

    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(user.email, resetToken)

    return { message: 'If the email exists, a reset link has been sent' }
  }

  async resetPassword(token, newPassword) {
    // Get user ID from Redis
    const userId = await redisClient.get(`reset_token:${token}`)
    
    if (!userId) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Update password
    await user.update({ password: newPassword })

    // Remove reset token
    await redisClient.del(`reset_token:${token}`)

    // Invalidate all refresh tokens
    await redisClient.del(`refresh_token:${userId}`)

    return { message: 'Password reset successfully' }
  }
}

module.exports = new AuthService()