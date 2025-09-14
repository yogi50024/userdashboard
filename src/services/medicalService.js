const { Op } = require('sequelize')
const { Doctor, Appointment, LabTest, LabBooking, VirtualQueue, Pharmacy, Medication, PrescriptionOrder, PatientTransfer, Vaccination, VaccinationBooking } = require('../models')
const { AppError, formatResponse, formatPaginatedResponse, getPaginationParams, buildPaginationMeta } = require('../utils/helpers')
const { publishMessage } = require('../config/rabbitmq')

class MedicalService {
  // Doctor Management
  async getDoctors(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.specialization) {
      where.specialization = { [Op.iLike]: `%${filters.specialization}%` }
    }

    if (filters.isOnlineConsultationAvailable !== undefined) {
      where.isOnlineConsultationAvailable = filters.isOnlineConsultationAvailable
    }

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      order: [['rating', 'DESC'], ['name', 'ASC']],
      limit,
      offset
    })

    return {
      doctors: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getDoctorById(doctorId) {
    const doctor = await Doctor.findByPk(doctorId)
    
    if (!doctor || !doctor.isActive) {
      throw new AppError('Doctor not found', 404)
    }

    return doctor
  }

  // Appointment Management
  async createAppointment(userId, appointmentData) {
    // Check if doctor exists and is active
    const doctor = await Doctor.findByPk(appointmentData.doctorId)
    if (!doctor || !doctor.isActive) {
      throw new AppError('Doctor not found', 404)
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        status: { [Op.notIn]: ['cancelled', 'no-show'] }
      }
    })

    if (existingAppointment) {
      throw new AppError('Appointment slot is not available', 400)
    }

    const appointment = await Appointment.create({
      ...appointmentData,
      userId,
      fee: doctor.consultationFee
    })

    // Schedule reminder
    await this.scheduleAppointmentReminder(appointment)

    return appointment
  }

  async getAppointments(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.appointmentType) {
      where.appointmentType = filters.appointmentType
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'clinicName']
        }
      ],
      order: [['appointmentDate', 'DESC']],
      limit,
      offset
    })

    return {
      appointments: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateAppointment(userId, appointmentId, updateData) {
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, userId }
    })

    if (!appointment) {
      throw new AppError('Appointment not found', 404)
    }

    // Don't allow updating completed or cancelled appointments
    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw new AppError('Cannot update completed or cancelled appointment', 400)
    }

    await appointment.update(updateData)
    return appointment
  }

  async cancelAppointment(userId, appointmentId) {
    const appointment = await Appointment.findOne({
      where: { id: appointmentId, userId }
    })

    if (!appointment) {
      throw new AppError('Appointment not found', 404)
    }

    if (appointment.status === 'cancelled') {
      throw new AppError('Appointment is already cancelled', 400)
    }

    await appointment.update({ status: 'cancelled' })
    
    // Notify about cancellation
    await publishMessage('notifications.appointment', {
      type: 'appointment_cancelled',
      userId,
      appointmentId: appointment.id,
      doctorId: appointment.doctorId
    })

    return { message: 'Appointment cancelled successfully' }
  }

  // Lab Services
  async getLabTests(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` }
    }

    const { count, rows } = await LabTest.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      tests: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async bookLabTest(userId, bookingData) {
    // Validate test IDs
    const tests = await LabTest.findAll({
      where: {
        id: { [Op.in]: bookingData.testIds },
        isActive: true
      }
    })

    if (tests.length !== bookingData.testIds.length) {
      throw new AppError('Some tests are not available', 400)
    }

    // Calculate total amount
    const totalAmount = tests.reduce((sum, test) => sum + (test.price || 0), 0)

    const booking = await LabBooking.create({
      ...bookingData,
      userId,
      totalAmount
    })

    // Schedule collection reminder
    await this.scheduleLabReminder(booking)

    return booking
  }

  async getLabBookings(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    const { count, rows } = await LabBooking.findAndCountAll({
      where,
      order: [['scheduledDate', 'DESC']],
      limit,
      offset
    })

    return {
      bookings: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  // Virtual Queue
  async joinVirtualQueue(userId, queueData) {
    // Get current queue position
    const lastPosition = await VirtualQueue.findOne({
      where: {
        serviceType: queueData.serviceType,
        serviceId: queueData.serviceId,
        status: { [Op.in]: ['waiting', 'called'] }
      },
      order: [['queueNumber', 'DESC']]
    })

    const queueNumber = (lastPosition?.queueNumber || 0) + 1
    const currentPosition = await VirtualQueue.count({
      where: {
        serviceType: queueData.serviceType,
        serviceId: queueData.serviceId,
        status: 'waiting'
      }
    }) + 1

    const queueEntry = await VirtualQueue.create({
      ...queueData,
      userId,
      queueNumber,
      currentPosition,
      estimatedWaitTime: currentPosition * 15 // 15 minutes per person
    })

    return queueEntry
  }

  async getQueueStatus(userId, queueId) {
    const queueEntry = await VirtualQueue.findOne({
      where: { id: queueId, userId }
    })

    if (!queueEntry) {
      throw new AppError('Queue entry not found', 404)
    }

    // Update current position
    const currentPosition = await VirtualQueue.count({
      where: {
        serviceType: queueEntry.serviceType,
        serviceId: queueEntry.serviceId,
        status: 'waiting',
        queueNumber: { [Op.lt]: queueEntry.queueNumber }
      }
    }) + 1

    await queueEntry.update({
      currentPosition,
      estimatedWaitTime: currentPosition * 15
    })

    return queueEntry
  }

  // Pharmacy & Prescriptions
  async getPharmacies(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.isDeliveryAvailable !== undefined) {
      where.isDeliveryAvailable = filters.isDeliveryAvailable
    }

    const { count, rows } = await Pharmacy.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      pharmacies: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async orderPrescription(userId, orderData) {
    const pharmacy = await Pharmacy.findByPk(orderData.pharmacyId)
    if (!pharmacy || !pharmacy.isActive) {
      throw new AppError('Pharmacy not found', 404)
    }

    const order = await PrescriptionOrder.create({
      ...orderData,
      userId
    })

    // Notify pharmacy
    await publishMessage('notifications.pharmacy', {
      type: 'new_prescription_order',
      orderId: order.id,
      pharmacyId: order.pharmacyId,
      userId
    })

    return order
  }

  async getPrescriptionOrders(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    const { count, rows } = await PrescriptionOrder.findAndCountAll({
      where,
      include: [
        {
          model: Pharmacy,
          as: 'pharmacy',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      orders: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  // Patient Transfer
  async requestPatientTransfer(userId, transferData) {
    const transfer = await PatientTransfer.create({
      ...transferData,
      userId
    })

    // Notify transfer service
    await publishMessage('notifications.transfer', {
      type: 'transfer_request',
      transferId: transfer.id,
      urgency: transfer.urgency,
      userId
    })

    return transfer
  }

  async getPatientTransfers(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    const { count, rows } = await PatientTransfer.findAndCountAll({
      where,
      order: [['scheduledDate', 'ASC']],
      limit,
      offset
    })

    return {
      transfers: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  // Vaccination Services
  async getVaccinations(pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { isActive: true }

    if (filters.ageGroup) {
      where.ageGroup = { [Op.iLike]: `%${filters.ageGroup}%` }
    }

    const { count, rows } = await Vaccination.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      vaccinations: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async bookVaccination(userId, bookingData) {
    const vaccination = await Vaccination.findByPk(bookingData.vaccinationId)
    if (!vaccination || !vaccination.isActive) {
      throw new AppError('Vaccination not found', 404)
    }

    const booking = await VaccinationBooking.create({
      ...bookingData,
      userId
    })

    // Schedule reminder
    await this.scheduleVaccinationReminder(booking)

    return booking
  }

  async getVaccinationBookings(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.status) {
      where.status = filters.status
    }

    const { count, rows } = await VaccinationBooking.findAndCountAll({
      where,
      include: [
        {
          model: Vaccination,
          as: 'vaccination',
          attributes: ['id', 'name', 'description', 'doses']
        }
      ],
      order: [['scheduledDate', 'ASC']],
      limit,
      offset
    })

    return {
      bookings: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  // Helper methods for scheduling reminders
  async scheduleAppointmentReminder(appointment) {
    const reminderTime = new Date(appointment.appointmentDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours before

    await publishMessage('reminders.schedule', {
      type: 'appointment_reminder',
      appointmentId: appointment.id,
      userId: appointment.userId,
      scheduledAt: reminderTime,
      title: 'Appointment Reminder',
      description: `You have an appointment scheduled for ${appointment.appointmentDate}`
    })
  }

  async scheduleLabReminder(booking) {
    const reminderTime = new Date(booking.scheduledDate.getTime() - 2 * 60 * 60 * 1000) // 2 hours before

    await publishMessage('reminders.schedule', {
      type: 'lab_reminder',
      bookingId: booking.id,
      userId: booking.userId,
      scheduledAt: reminderTime,
      title: 'Lab Test Reminder',
      description: `Your lab test is scheduled for ${booking.scheduledDate}`
    })
  }

  async scheduleVaccinationReminder(booking) {
    const reminderTime = new Date(booking.scheduledDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours before

    await publishMessage('reminders.schedule', {
      type: 'vaccination_reminder',
      bookingId: booking.id,
      userId: booking.userId,
      scheduledAt: reminderTime,
      title: 'Vaccination Reminder',
      description: `Vaccination appointment for ${booking.patientName} is scheduled for ${booking.scheduledDate}`
    })
  }
}

module.exports = new MedicalService()