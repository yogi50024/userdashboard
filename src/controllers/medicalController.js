const medicalService = require('../services/medicalService')
const { formatResponse, formatPaginatedResponse, getPaginationParams } = require('../utils/helpers')

class MedicalController {
  // Doctor Management
  async getDoctors(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      specialization: req.query.specialization,
      isOnlineConsultationAvailable: req.query.isOnlineConsultationAvailable === 'true'
    }
    const result = await medicalService.getDoctors(pagination, filters)
    res.json(formatPaginatedResponse(result.doctors, result.pagination, 'Doctors retrieved successfully'))
  }

  async getDoctorById(req, res) {
    const doctor = await medicalService.getDoctorById(req.params.id)
    res.json(formatResponse(doctor, 'Doctor details retrieved successfully'))
  }

  // Appointment Management
  async createAppointment(req, res) {
    const appointment = await medicalService.createAppointment(req.user.id, req.body)
    res.status(201).json(formatResponse(appointment, 'Appointment booked successfully'))
  }

  async getAppointments(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status,
      appointmentType: req.query.appointmentType
    }
    const result = await medicalService.getAppointments(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.appointments, result.pagination, 'Appointments retrieved successfully'))
  }

  async updateAppointment(req, res) {
    const appointment = await medicalService.updateAppointment(req.user.id, req.params.id, req.body)
    res.json(formatResponse(appointment, 'Appointment updated successfully'))
  }

  async cancelAppointment(req, res) {
    const result = await medicalService.cancelAppointment(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  // Lab Services
  async getLabTests(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      category: req.query.category,
      search: req.query.search
    }
    const result = await medicalService.getLabTests(pagination, filters)
    res.json(formatPaginatedResponse(result.tests, result.pagination, 'Lab tests retrieved successfully'))
  }

  async bookLabTest(req, res) {
    const booking = await medicalService.bookLabTest(req.user.id, req.body)
    res.status(201).json(formatResponse(booking, 'Lab test booked successfully'))
  }

  async getLabBookings(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status
    }
    const result = await medicalService.getLabBookings(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.bookings, result.pagination, 'Lab bookings retrieved successfully'))
  }

  // Virtual Queue
  async joinVirtualQueue(req, res) {
    const queueEntry = await medicalService.joinVirtualQueue(req.user.id, req.body)
    res.status(201).json(formatResponse(queueEntry, 'Joined virtual queue successfully'))
  }

  async getQueueStatus(req, res) {
    const queueEntry = await medicalService.getQueueStatus(req.user.id, req.params.id)
    res.json(formatResponse(queueEntry, 'Queue status retrieved successfully'))
  }

  // Pharmacy & Prescriptions
  async getPharmacies(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      isDeliveryAvailable: req.query.isDeliveryAvailable === 'true'
    }
    const result = await medicalService.getPharmacies(pagination, filters)
    res.json(formatPaginatedResponse(result.pharmacies, result.pagination, 'Pharmacies retrieved successfully'))
  }

  async orderPrescription(req, res) {
    const order = await medicalService.orderPrescription(req.user.id, req.body)
    res.status(201).json(formatResponse(order, 'Prescription order placed successfully'))
  }

  async getPrescriptionOrders(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status
    }
    const result = await medicalService.getPrescriptionOrders(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.orders, result.pagination, 'Prescription orders retrieved successfully'))
  }

  // Patient Transfer
  async requestPatientTransfer(req, res) {
    const transfer = await medicalService.requestPatientTransfer(req.user.id, req.body)
    res.status(201).json(formatResponse(transfer, 'Patient transfer requested successfully'))
  }

  async getPatientTransfers(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status
    }
    const result = await medicalService.getPatientTransfers(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.transfers, result.pagination, 'Patient transfers retrieved successfully'))
  }

  // Vaccination Services
  async getVaccinations(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      ageGroup: req.query.ageGroup
    }
    const result = await medicalService.getVaccinations(pagination, filters)
    res.json(formatPaginatedResponse(result.vaccinations, result.pagination, 'Vaccinations retrieved successfully'))
  }

  async bookVaccination(req, res) {
    const booking = await medicalService.bookVaccination(req.user.id, req.body)
    res.status(201).json(formatResponse(booking, 'Vaccination booked successfully'))
  }

  async getVaccinationBookings(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      status: req.query.status
    }
    const result = await medicalService.getVaccinationBookings(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.bookings, result.pagination, 'Vaccination bookings retrieved successfully'))
  }
}

module.exports = new MedicalController()