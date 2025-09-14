const { Op } = require('sequelize')
const { HomeService, ServiceProvider, HomeServiceBooking, AssistanceRequest } = require('../models')
const { AppError, formatResponse, formatPaginatedResponse, getPaginationParams, buildPaginationMeta } = require('../utils/helpers')
const { publishMessage } = require('../config/rabbitmq')

class HomeServiceService {
  // Home Services Management
  async getHomeServices(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.category) {
      where.category = filters.category
    }

    const { count, rows } = await HomeService.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      services: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getHomeServiceById(serviceId) {
    const service = await HomeService.findByPk(serviceId)
    
    if (!service || !service.isActive) {
      throw new AppError('Home service not found', 404)
    }

    return service
  }

  // Service Providers Management
  async getServiceProviders(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true, isVerified: true }

    if (filters.services && Array.isArray(filters.services)) {
      where.services = { [Op.overlap]: filters.services }
    }

    if (filters.location) {
      where.location = { [Op.iLike]: `%${filters.location}%` }
    }

    if (filters.minRating) {
      where.rating = { [Op.gte]: parseFloat(filters.minRating) }
    }

    const { count, rows } = await ServiceProvider.findAndCountAll({
      where,
      order: [['rating', 'DESC'], ['name', 'ASC']],
      limit,
      offset
    })

    return {
      providers: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getServiceProviderById(providerId) {
    const provider = await ServiceProvider.findByPk(providerId)
    
    if (!provider || !provider.isActive || !provider.isVerified) {
      throw new AppError('Service provider not found', 404)
    }

    return provider
  }

  // Home Service Bookings
  async bookHomeService(userId, bookingData) {
    // Validate service exists
    const service = await HomeService.findByPk(bookingData.serviceId)
    if (!service || !service.isActive) {
      throw new AppError('Home service not found', 404)
    }

    // Validate provider if specified
    if (bookingData.providerId) {
      const provider = await ServiceProvider.findByPk(bookingData.providerId)
      if (!provider || !provider.isActive || !provider.isVerified) {
        throw new AppError('Service provider not found', 404)
      }

      // Check if provider offers this service
      if (!provider.services.includes(bookingData.serviceId)) {
        throw new AppError('Provider does not offer this service', 400)
      }
    }

    // Calculate total amount
    const totalAmount = (service.hourlyRate || 0) * bookingData.duration

    const booking = await HomeServiceBooking.create({
      ...bookingData,
      userId,
      totalAmount
    })

    // Notify service provider or find available provider
    if (bookingData.providerId) {
      await this.notifyServiceProvider(booking)
    } else {
      await this.findAvailableProvider(booking)
    }

    return booking
  }

  async getHomeServiceBookings(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.serviceCategory) {
      // Join with HomeService to filter by category
      // This would need to be adjusted based on your exact requirements
    }

    const { count, rows } = await HomeServiceBooking.findAndCountAll({
      where,
      include: [
        {
          model: HomeService,
          as: 'service',
          attributes: ['id', 'name', 'category', 'description']
        },
        {
          model: ServiceProvider,
          as: 'provider',
          attributes: ['id', 'name', 'phone', 'rating'],
          required: false
        }
      ],
      order: [['scheduledDate', 'DESC']],
      limit,
      offset
    })

    return {
      bookings: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateHomeServiceBooking(userId, bookingId, updateData) {
    const booking = await HomeServiceBooking.findOne({
      where: { id: bookingId, userId }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    // Don't allow updating completed or cancelled bookings
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new AppError('Cannot update completed or cancelled booking', 400)
    }

    await booking.update(updateData)
    return booking
  }

  async cancelHomeServiceBooking(userId, bookingId) {
    const booking = await HomeServiceBooking.findOne({
      where: { id: bookingId, userId }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400)
    }

    await booking.update({ status: 'cancelled' })

    // Notify provider if assigned
    if (booking.providerId) {
      await publishMessage('notifications.service_provider', {
        type: 'booking_cancelled',
        providerId: booking.providerId,
        bookingId: booking.id,
        userId
      })
    }

    return { message: 'Booking cancelled successfully' }
  }

  // Assistance Requests
  async createAssistanceRequest(userId, requestData) {
    const request = await AssistanceRequest.create({
      ...requestData,
      userId
    })

    // Notify support team
    await publishMessage('notifications.support', {
      type: 'assistance_request',
      requestId: request.id,
      userId,
      priority: request.priority,
      type: request.type
    })

    return request
  }

  async getAssistanceRequests(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.type) {
      where.type = filters.type
    }

    const { count, rows } = await AssistanceRequest.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      requests: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateAssistanceRequest(userId, requestId, updateData) {
    const request = await AssistanceRequest.findOne({
      where: { id: requestId, userId }
    })

    if (!request) {
      throw new AppError('Assistance request not found', 404)
    }

    // Set completion time if status changed to completed
    if (updateData.status === 'completed' && !request.completedAt) {
      updateData.completedAt = new Date()
    }

    await request.update(updateData)
    return request
  }

  async deleteAssistanceRequest(userId, requestId) {
    const request = await AssistanceRequest.findOne({
      where: { id: requestId, userId }
    })

    if (!request) {
      throw new AppError('Assistance request not found', 404)
    }

    if (request.status !== 'open') {
      throw new AppError('Cannot delete assigned or completed request', 400)
    }

    await request.update({ status: 'cancelled' })
    return { message: 'Assistance request cancelled successfully' }
  }

  // Helper methods
  async notifyServiceProvider(booking) {
    await publishMessage('notifications.service_provider', {
      type: 'new_booking',
      providerId: booking.providerId,
      bookingId: booking.id,
      scheduledDate: booking.scheduledDate,
      duration: booking.duration,
      address: booking.address
    })
  }

  async findAvailableProvider(booking) {
    // Find available providers for the service
    const providers = await ServiceProvider.findAll({
      where: {
        services: { [Op.contains]: [booking.serviceId] },
        isActive: true,
        isVerified: true
      },
      order: [['rating', 'DESC']]
    })

    if (providers.length > 0) {
      // Assign to highest rated provider (you could implement more sophisticated logic)
      await booking.update({ providerId: providers[0].id, status: 'assigned' })
      await this.notifyServiceProvider(booking)
    } else {
      // Notify admin to find a provider
      await publishMessage('notifications.admin', {
        type: 'provider_needed',
        bookingId: booking.id,
        serviceId: booking.serviceId,
        location: booking.address
      })
    }
  }

  // Rating and Feedback
  async rateServiceProvider(userId, bookingId, rating, feedback) {
    const booking = await HomeServiceBooking.findOne({
      where: { id: bookingId, userId, status: 'completed' }
    })

    if (!booking) {
      throw new AppError('Completed booking not found', 404)
    }

    if (booking.rating) {
      throw new AppError('Booking already rated', 400)
    }

    await booking.update({ rating, feedback })

    // Update provider's average rating
    if (booking.providerId) {
      await this.updateProviderRating(booking.providerId)
    }

    return { message: 'Rating submitted successfully' }
  }

  async updateProviderRating(providerId) {
    const bookings = await HomeServiceBooking.findAll({
      where: {
        providerId,
        rating: { [Op.ne]: null }
      },
      attributes: ['rating']
    })

    if (bookings.length > 0) {
      const averageRating = bookings.reduce((sum, booking) => sum + booking.rating, 0) / bookings.length
      
      await ServiceProvider.update(
        { rating: Math.round(averageRating * 100) / 100 }, // Round to 2 decimal places
        { where: { id: providerId } }
      )
    }
  }
}

module.exports = new HomeServiceService()