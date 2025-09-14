const { Op } = require('sequelize')
const { DietPlan, ExerciseProgram, YogaSession, UserWellnessSubscription } = require('../models')
const { AppError, formatResponse, formatPaginatedResponse, getPaginationParams, buildPaginationMeta } = require('../utils/helpers')

class WellnessService {
  // Diet Plans
  async getDietPlans(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.maxDuration) {
      where.duration = { [Op.lte]: parseInt(filters.maxDuration) }
    }

    const { count, rows } = await DietPlan.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      dietPlans: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getDietPlanById(planId) {
    const plan = await DietPlan.findByPk(planId)
    
    if (!plan || !plan.isActive) {
      throw new AppError('Diet plan not found', 404)
    }

    return plan
  }

  // Exercise Programs
  async getExercisePrograms(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.level) {
      where.level = filters.level
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.maxDuration) {
      where.duration = { [Op.lte]: parseInt(filters.maxDuration) }
    }

    const { count, rows } = await ExerciseProgram.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      programs: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getExerciseProgramById(programId) {
    const program = await ExerciseProgram.findByPk(programId)
    
    if (!program || !program.isActive) {
      throw new AppError('Exercise program not found', 404)
    }

    return program
  }

  // Yoga Sessions
  async getYogaSessions(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.level) {
      where.level = filters.level
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.maxDuration) {
      where.duration = { [Op.lte]: parseInt(filters.maxDuration) }
    }

    const { count, rows } = await YogaSession.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      sessions: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getYogaSessionById(sessionId) {
    const session = await YogaSession.findByPk(sessionId)
    
    if (!session || !session.isActive) {
      throw new AppError('Yoga session not found', 404)
    }

    return session
  }

  // User Wellness Subscriptions
  async subscribeToWellness(userId, subscriptionData) {
    // Check if user already has an active subscription of the same type
    const existingSubscription = await UserWellnessSubscription.findOne({
      where: {
        userId,
        subscriptionType: subscriptionData.subscriptionType,
        status: 'active'
      }
    })

    if (existingSubscription) {
      throw new AppError('You already have an active subscription of this type', 400)
    }

    // Validate resource if provided
    if (subscriptionData.resourceId) {
      await this.validateWellnessResource(subscriptionData.subscriptionType, subscriptionData.resourceId)
    }

    const subscription = await UserWellnessSubscription.create({
      ...subscriptionData,
      userId
    })

    return subscription
  }

  async getUserWellnessSubscriptions(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.subscriptionType) {
      where.subscriptionType = filters.subscriptionType
    }

    if (filters.status) {
      where.status = filters.status
    }

    const { count, rows } = await UserWellnessSubscription.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      subscriptions: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateWellnessSubscription(userId, subscriptionId, updateData) {
    const subscription = await UserWellnessSubscription.findOne({
      where: { id: subscriptionId, userId }
    })

    if (!subscription) {
      throw new AppError('Wellness subscription not found', 404)
    }

    await subscription.update(updateData)
    return subscription
  }

  async pauseWellnessSubscription(userId, subscriptionId) {
    const subscription = await UserWellnessSubscription.findOne({
      where: { id: subscriptionId, userId }
    })

    if (!subscription) {
      throw new AppError('Wellness subscription not found', 404)
    }

    if (subscription.status !== 'active') {
      throw new AppError('Can only pause active subscriptions', 400)
    }

    await subscription.update({ status: 'paused' })
    return { message: 'Subscription paused successfully' }
  }

  async resumeWellnessSubscription(userId, subscriptionId) {
    const subscription = await UserWellnessSubscription.findOne({
      where: { id: subscriptionId, userId }
    })

    if (!subscription) {
      throw new AppError('Wellness subscription not found', 404)
    }

    if (subscription.status !== 'paused') {
      throw new AppError('Can only resume paused subscriptions', 400)
    }

    await subscription.update({ status: 'active' })
    return { message: 'Subscription resumed successfully' }
  }

  async cancelWellnessSubscription(userId, subscriptionId) {
    const subscription = await UserWellnessSubscription.findOne({
      where: { id: subscriptionId, userId }
    })

    if (!subscription) {
      throw new AppError('Wellness subscription not found', 404)
    }

    if (subscription.status === 'cancelled') {
      throw new AppError('Subscription is already cancelled', 400)
    }

    await subscription.update({ status: 'cancelled' })
    return { message: 'Subscription cancelled successfully' }
  }

  async updateProgress(userId, subscriptionId, progressData) {
    const subscription = await UserWellnessSubscription.findOne({
      where: { id: subscriptionId, userId }
    })

    if (!subscription) {
      throw new AppError('Wellness subscription not found', 404)
    }

    // Merge new progress data with existing progress
    const updatedProgress = {
      ...subscription.progress,
      ...progressData,
      lastUpdated: new Date()
    }

    await subscription.update({ progress: updatedProgress })
    return subscription
  }

  // Helper method to validate wellness resources
  async validateWellnessResource(subscriptionType, resourceId) {
    let resource = null

    switch (subscriptionType) {
      case 'diet':
        resource = await DietPlan.findByPk(resourceId)
        break
      case 'exercise':
        resource = await ExerciseProgram.findByPk(resourceId)
        break
      case 'yoga':
        resource = await YogaSession.findByPk(resourceId)
        break
      case 'wellness-combo':
        // For combo subscriptions, resourceId might not be needed
        return true
      default:
        throw new AppError('Invalid subscription type', 400)
    }

    if (!resource || !resource.isActive) {
      throw new AppError(`${subscriptionType} resource not found`, 404)
    }

    return true
  }

  // Get recommended content based on user preferences and progress
  async getRecommendedContent(userId, contentType, pagination) {
    const { limit, offset } = pagination
    
    // Get user's current subscriptions to understand preferences
    const subscriptions = await UserWellnessSubscription.findAll({
      where: { userId, status: 'active' }
    })

    let where = { isActive: true }
    let model = null

    switch (contentType) {
      case 'diet':
        model = DietPlan
        break
      case 'exercise':
        model = ExerciseProgram
        // Recommend based on user's fitness level from subscriptions
        if (subscriptions.some(s => s.progress?.fitnessLevel)) {
          const fitnessLevel = subscriptions.find(s => s.progress?.fitnessLevel)?.progress.fitnessLevel
          where.level = fitnessLevel
        }
        break
      case 'yoga':
        model = YogaSession
        break
      default:
        throw new AppError('Invalid content type', 400)
    }

    const { count, rows } = await model.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      content: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }
}

module.exports = new WellnessService()