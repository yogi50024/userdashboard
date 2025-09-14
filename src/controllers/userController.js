const userService = require('../services/userService')
const { formatResponse } = require('../utils/helpers')

class UserController {
  async getUserProfile(req, res) {
    const user = await userService.getUserProfile(req.user.id)
    res.json(formatResponse(user, 'User profile retrieved successfully'))
  }

  async updateUserProfile(req, res) {
    const user = await userService.updateUserProfile(req.user.id, req.body)
    res.json(formatResponse(user, 'User profile updated successfully'))
  }

  async updateUserPreferences(req, res) {
    const user = await userService.updateUserPreferences(req.user.id, req.body)
    res.json(formatResponse(user, 'User preferences updated successfully'))
  }

  async uploadProfilePicture(req, res) {
    if (!req.file) {
      return res.status(400).json(formatResponse(null, 'No file uploaded', false))
    }

    const user = await userService.uploadProfilePicture(req.user.id, req.file.path)
    res.json(formatResponse(user, 'Profile picture uploaded successfully'))
  }

  async deactivateAccount(req, res) {
    const result = await userService.deactivateAccount(req.user.id)
    res.json(formatResponse(result))
  }

  async getUserStats(req, res) {
    const stats = await userService.getUserStats(req.user.id)
    res.json(formatResponse(stats, 'User statistics retrieved successfully'))
  }
}

module.exports = new UserController()