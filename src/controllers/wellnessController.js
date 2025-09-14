const wellnessService = require('../services/wellnessService')
const { formatResponse, formatPaginatedResponse, getPaginationParams } = require('../utils/helpers')

class WellnessController {
  // Diet Plans
  async getDietPlans(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      category: req.query.category,
      maxDuration: req.query.maxDuration
    }
    const result = await wellnessService.getDietPlans(pagination, filters)
    res.json(formatPaginatedResponse(result.dietPlans, result.pagination, 'Diet plans retrieved successfully'))
  }

  async getDietPlanById(req, res) {
    const plan = await wellnessService.getDietPlanById(req.params.id)
    res.json(formatResponse(plan, 'Diet plan details retrieved successfully'))
  }

  // Exercise Programs
  async getExercisePrograms(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      level: req.query.level,
      category: req.query.category,
      maxDuration: req.query.maxDuration
    }
    const result = await wellnessService.getExercisePrograms(pagination, filters)
    res.json(formatPaginatedResponse(result.programs, result.pagination, 'Exercise programs retrieved successfully'))
  }

  async getExerciseProgramById(req, res) {
    const program = await wellnessService.getExerciseProgramById(req.params.id)
    res.json(formatResponse(program, 'Exercise program details retrieved successfully'))
  }

  // Yoga Sessions
  async getYogaSessions(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      level: req.query.level,
      type: req.query.type,
      maxDuration: req.query.maxDuration
    }
    const result = await wellnessService.getYogaSessions(pagination, filters)
    res.json(formatPaginatedResponse(result.sessions, result.pagination, 'Yoga sessions retrieved successfully'))
  }

  async getYogaSessionById(req, res) {
    const session = await wellnessService.getYogaSessionById(req.params.id)
    res.json(formatResponse(session, 'Yoga session details retrieved successfully'))
  }

  // User Wellness Subscriptions
  async subscribeToWellness(req, res) {
    const subscription = await wellnessService.subscribeToWellness(req.user.id, req.body)
    res.status(201).json(formatResponse(subscription, 'Wellness subscription created successfully'))
  }

  async getUserWellnessSubscriptions(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      subscriptionType: req.query.subscriptionType,
      status: req.query.status
    }
    const result = await wellnessService.getUserWellnessSubscriptions(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.subscriptions, result.pagination, 'Wellness subscriptions retrieved successfully'))
  }

  async updateWellnessSubscription(req, res) {
    const subscription = await wellnessService.updateWellnessSubscription(req.user.id, req.params.id, req.body)
    res.json(formatResponse(subscription, 'Wellness subscription updated successfully'))
  }

  async pauseWellnessSubscription(req, res) {
    const result = await wellnessService.pauseWellnessSubscription(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  async resumeWellnessSubscription(req, res) {
    const result = await wellnessService.resumeWellnessSubscription(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  async cancelWellnessSubscription(req, res) {
    const result = await wellnessService.cancelWellnessSubscription(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  async updateProgress(req, res) {
    const subscription = await wellnessService.updateProgress(req.user.id, req.params.id, req.body)
    res.json(formatResponse(subscription, 'Progress updated successfully'))
  }

  async getRecommendedContent(req, res) {
    const pagination = getPaginationParams(req)
    const contentType = req.params.type
    const result = await wellnessService.getRecommendedContent(req.user.id, contentType, pagination)
    res.json(formatPaginatedResponse(result.content, result.pagination, 'Recommended content retrieved successfully'))
  }
}

module.exports = new WellnessController()