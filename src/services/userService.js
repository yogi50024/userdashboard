const { User } = require('../models')
const { AppError, sanitizeUser } = require('../utils/helpers')

class UserService {
  async getUserProfile(userId) {
    const user = await User.findByPk(userId)
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404)
    }

    return sanitizeUser(user)
  }

  async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId)
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404)
    }

    // Don't allow updating sensitive fields through this endpoint
    const sensitiveFields = ['password', 'email', 'isVerified', 'isActive']
    sensitiveFields.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field]
      }
    })

    await user.update(updateData)
    return sanitizeUser(user)
  }

  async updateUserPreferences(userId, preferences) {
    const user = await User.findByPk(userId)
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404)
    }

    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    }

    await user.update({ preferences: updatedPreferences })
    return sanitizeUser(user)
  }

  async uploadProfilePicture(userId, filePath) {
    const user = await User.findByPk(userId)
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404)
    }

    await user.update({ profilePicture: filePath })
    return sanitizeUser(user)
  }

  async deactivateAccount(userId) {
    const user = await User.findByPk(userId)
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404)
    }

    await user.update({ isActive: false })
    return { message: 'Account deactivated successfully' }
  }

  async getUserStats(userId) {
    // This could be expanded to include various user statistics
    const user = await User.findByPk(userId)
    
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404)
    }

    // Calculate account age
    const accountAge = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24))

    return {
      accountAge,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      isVerified: user.isVerified,
      profileComplete: this.calculateProfileCompleteness(user)
    }
  }

  calculateProfileCompleteness(user) {
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'address',
      'city',
      'state',
      'zipCode'
    ]

    const completedFields = requiredFields.filter(field => 
      user[field] && user[field].toString().trim().length > 0
    )

    return Math.round((completedFields.length / requiredFields.length) * 100)
  }
}

module.exports = new UserService()