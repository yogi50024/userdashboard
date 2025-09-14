const familyService = require('../services/familyService')
const { formatResponse, formatPaginatedResponse, getPaginationParams } = require('../utils/helpers')

class FamilyController {
  // Family Members Management
  async createFamilyMember(req, res) {
    const member = await familyService.createFamilyMember(req.user.id, req.body)
    res.status(201).json(formatResponse(member, 'Family member created successfully'))
  }

  async getFamilyMembers(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      relationship: req.query.relationship,
      isDependent: req.query.isDependent === 'true'
    }
    const result = await familyService.getFamilyMembers(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.members, result.pagination, 'Family members retrieved successfully'))
  }

  async getFamilyMemberById(req, res) {
    const member = await familyService.getFamilyMemberById(req.user.id, req.params.id)
    res.json(formatResponse(member, 'Family member details retrieved successfully'))
  }

  async updateFamilyMember(req, res) {
    const member = await familyService.updateFamilyMember(req.user.id, req.params.id, req.body)
    res.json(formatResponse(member, 'Family member updated successfully'))
  }

  async deleteFamilyMember(req, res) {
    const result = await familyService.deleteFamilyMember(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  // Medical History Management
  async createMedicalHistory(req, res) {
    const history = await familyService.createMedicalHistory(req.user.id, req.body)
    res.status(201).json(formatResponse(history, 'Medical history record created successfully'))
  }

  async getMedicalHistory(req, res) {
    const pagination = getPaginationParams(req)
    const filters = {
      recordType: req.query.recordType,
      familyMemberId: req.query.familyMemberId
    }
    const result = await familyService.getMedicalHistory(req.user.id, pagination, filters)
    res.json(formatPaginatedResponse(result.history, result.pagination, 'Medical history retrieved successfully'))
  }

  async updateMedicalHistory(req, res) {
    const history = await familyService.updateMedicalHistory(req.user.id, req.params.id, req.body)
    res.json(formatResponse(history, 'Medical history record updated successfully'))
  }

  async deleteMedicalHistory(req, res) {
    const result = await familyService.deleteMedicalHistory(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  // Health Permissions Management
  async grantHealthPermission(req, res) {
    const permission = await familyService.grantHealthPermission(req.user.id, req.body)
    res.status(201).json(formatResponse(permission, 'Health permission granted successfully'))
  }

  async getGrantedHealthPermissions(req, res) {
    const pagination = getPaginationParams(req)
    const result = await familyService.getHealthPermissions(req.user.id, pagination, 'granted')
    res.json(formatPaginatedResponse(result.permissions, result.pagination, 'Granted health permissions retrieved successfully'))
  }

  async getReceivedHealthPermissions(req, res) {
    const pagination = getPaginationParams(req)
    const result = await familyService.getHealthPermissions(req.user.id, pagination, 'received')
    res.json(formatPaginatedResponse(result.permissions, result.pagination, 'Received health permissions retrieved successfully'))
  }

  async updateHealthPermission(req, res) {
    const permission = await familyService.updateHealthPermission(req.user.id, req.params.id, req.body)
    res.json(formatResponse(permission, 'Health permission updated successfully'))
  }

  async revokeHealthPermission(req, res) {
    const result = await familyService.revokeHealthPermission(req.user.id, req.params.id)
    res.json(formatResponse(result))
  }

  // Shared Medical History
  async getSharedMedicalHistory(req, res) {
    const pagination = getPaginationParams(req)
    const { granterUserId, familyMemberId } = req.params
    
    const result = await familyService.getSharedMedicalHistory(
      req.user.id,
      granterUserId,
      familyMemberId || null,
      pagination
    )
    
    res.json(formatPaginatedResponse(result.history, result.pagination, 'Shared medical history retrieved successfully'))
  }
}

module.exports = new FamilyController()