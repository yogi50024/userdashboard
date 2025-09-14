const homeService = require('../services/homeService')
const { formatResponse, formatPaginatedResponse, getPaginationParams } = require('../utils/helpers')

class HomeServiceController {
  // Home Services
  async getHomeServices(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      category: req.query.category
    }
    const result = await homeService.getHomeServices(pagination, filters)
    res.json(formatPaginatedResponse(result.services, result.pagination, 'Home services retrieved successfully'))
  }

  async getHomeServiceById(req, res) {
    const service = await homeService.getHomeServiceById(req.params.id)
    res.json(formatResponse(service, 'Home service details retrieved successfully'))
  }

  // Service Providers
  async getServiceProviders(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      services: req.query.services ? req.query.services.split(',') : undefined,
      location: req.query.location,
      minRating: req.query.minRating
    }
    const result = await homeService.getServiceProviders(pagination, filters)
    res.json(formatPaginatedResponse(result.providers, result.pagination, 'Service providers retrieved successfully'))
  }

  async getServiceProviderById(req, res) {
    const provider = await homeService.getServiceProviderById(req.params.id)
    res.json(formatResponse(provider, 'Service provider details retrieved successfully'))
  }

  // Home Service Bookings
  async bookHomeService(req, res) {
    const booking = await homeService.bookHomeService(req.user.id, req.body)
    res.status(201).json(formatResponse(booking, 'Home service booked successfully'))
  }

  async getHomeServiceBookings(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status,
      serviceCategory: req.query.serviceCategory
    }
    const result = await homeService.getHomeServiceBookings(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.bookings, result.pagination, 'Home service bookings retrieved successfully'))
  }

  async updateHomeServiceBooking(req, res) {
    const booking = await homeService.updateHomeServiceBooking(req.user.id, req.params.id, req.body)
    res.json(formatResponse(booking, 'Booking updated successfully'))
  }

  async cancelHomeServiceBooking(req, res) {
    const result = await homeService.cancelHomeServiceBooking(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  async rateServiceProvider(req, res) {
    const { rating, feedback } = req.body
    const result = await homeService.rateServiceProvider(req.user.id, req.params.id, rating, feedback)
    res.json(formatResponse(result))
  }

  // Assistance Requests
  async createAssistanceRequest(req, res) {
    const request = await homeService.createAssistanceRequest(req.user.id, req.body)
    res.status(201).json(formatResponse(request, 'Assistance request created successfully'))
  }

  async getAssistanceRequests(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status,
      type: req.query.type
    }
    const result = await homeService.getAssistanceRequests(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.requests, result.pagination, 'Assistance requests retrieved successfully'))
  }

  async updateAssistanceRequest(req, res) {
    const request = await homeService.updateAssistanceRequest(req.user.id, req.params.id, req.body)
    res.json(formatResponse(request, 'Assistance request updated successfully'))
  }

  async deleteAssistanceRequest(req, res) {
    const result = await homeService.deleteAssistanceRequest(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }
}

module.exports = new HomeServiceController()