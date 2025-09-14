const authService = require('../services/authService')
const { formatResponse } = require('../utils/helpers')

class AuthController {
  async register(req, res) {
    const result = await authService.register(req.body)
    res.status(201).json(formatResponse(result, 'User registered successfully'))
  }

  async login(req, res) {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json(formatResponse(result, 'Login successful'))
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body
    const result = await authService.refreshToken(refreshToken)
    res.json(formatResponse(result, 'Token refreshed successfully'))
  }

  async logout(req, res) {
    const result = await authService.logout(req.user.id)
    res.json(formatResponse(result, 'Logout successful'))
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword)
    res.json(formatResponse(result, 'Password changed successfully'))
  }

  async forgotPassword(req, res) {
    const { email } = req.body
    const result = await authService.forgotPassword(email)
    res.json(formatResponse(result))
  }

  async resetPassword(req, res) {
    const { token, password } = req.body
    const result = await authService.resetPassword(token, password)
    res.json(formatResponse(result, 'Password reset successfully'))
  }

  async getProfile(req, res) {
    res.json(formatResponse(req.user, 'Profile retrieved successfully'))
  }
}

module.exports = new AuthController()