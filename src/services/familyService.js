const { Op } = require('sequelize')
const { FamilyMember, MedicalHistory, HealthPermission, User } = require('../models')
const { AppError, formatResponse, formatPaginatedResponse, getPaginationParams, buildPaginationMeta } = require('../utils/helpers')

class FamilyService {
  // Family Members Management
  async createFamilyMember(userId, memberData) {
    const member = await FamilyMember.create({
      ...memberData,
      userId
    })

    return member
  }

  async getFamilyMembers(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = { userId }

    if (filters.relationship) {
      where.relationship = { [Op.iLike]: `%${filters.relationship}%` }
    }

    if (filters.isDependent !== undefined) {
      where.isDependent = filters.isDependent
    }

    const { count, rows } = await FamilyMember.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset
    })

    return {
      members: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async getFamilyMemberById(userId, memberId) {
    const member = await FamilyMember.findOne({
      where: { id: memberId, userId }
    })

    if (!member) {
      throw new AppError('Family member not found', 404)
    }

    return member
  }

  async updateFamilyMember(userId, memberId, updateData) {
    const member = await FamilyMember.findOne({
      where: { id: memberId, userId }
    })

    if (!member) {
      throw new AppError('Family member not found', 404)
    }

    await member.update(updateData)
    return member
  }

  async deleteFamilyMember(userId, memberId) {
    const member = await FamilyMember.findOne({
      where: { id: memberId, userId }
    })

    if (!member) {
      throw new AppError('Family member not found', 404)
    }

    // Check if there are any active health permissions for this member
    const activePermissions = await HealthPermission.findOne({
      where: {
        familyMemberId: memberId,
        isActive: true
      }
    })

    if (activePermissions) {
      throw new AppError('Cannot delete family member with active health permissions', 400)
    }

    await member.destroy()
    return { message: 'Family member deleted successfully' }
  }

  // Medical History Management
  async createMedicalHistory(userId, historyData) {
    // Validate family member if provided
    if (historyData.familyMemberId) {
      const member = await FamilyMember.findOne({
        where: { id: historyData.familyMemberId, userId }
      })

      if (!member) {
        throw new AppError('Family member not found', 404)
      }
    } else {
      // If no family member specified, it's for the user themselves
      historyData.userId = userId
    }

    const history = await MedicalHistory.create(historyData)
    return history
  }

  async getMedicalHistory(userId, pagination, filters = {}) {
    const { limit, offset } = pagination
    const where = {
      [Op.or]: [
        { userId },
        {
          familyMemberId: {
            [Op.in]: await this.getUserFamilyMemberIds(userId)
          }
        }
      ]
    }

    if (filters.recordType) {
      where.recordType = filters.recordType
    }

    if (filters.familyMemberId) {
      // Validate that the family member belongs to the user
      const member = await FamilyMember.findOne({
        where: { id: filters.familyMemberId, userId }
      })

      if (!member) {
        throw new AppError('Family member not found', 404)
      }

      where.familyMemberId = filters.familyMemberId
      delete where[Op.or] // Override the OR condition
    }

    const { count, rows } = await MedicalHistory.findAndCountAll({
      where,
      include: [
        {
          model: FamilyMember,
          as: 'familyMember',
          attributes: ['id', 'name', 'relationship'],
          required: false
        }
      ],
      order: [['recordDate', 'DESC']],
      limit,
      offset
    })

    return {
      history: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateMedicalHistory(userId, historyId, updateData) {
    const history = await MedicalHistory.findOne({
      where: {
        id: historyId,
        [Op.or]: [
          { userId },
          {
            familyMemberId: {
              [Op.in]: await this.getUserFamilyMemberIds(userId)
            }
          }
        ]
      }
    })

    if (!history) {
      throw new AppError('Medical history record not found', 404)
    }

    await history.update(updateData)
    return history
  }

  async deleteMedicalHistory(userId, historyId) {
    const history = await MedicalHistory.findOne({
      where: {
        id: historyId,
        [Op.or]: [
          { userId },
          {
            familyMemberId: {
              [Op.in]: await this.getUserFamilyMemberIds(userId)
            }
          }
        ]
      }
    })

    if (!history) {
      throw new AppError('Medical history record not found', 404)
    }

    await history.destroy()
    return { message: 'Medical history record deleted successfully' }
  }

  // Health Permissions Management
  async grantHealthPermission(granterUserId, permissionData) {
    // Validate grantee user exists
    const granteeUser = await User.findByPk(permissionData.granteeUserId)
    if (!granteeUser || !granteeUser.isActive) {
      throw new AppError('Grantee user not found', 404)
    }

    // Validate family member if specified
    if (permissionData.familyMemberId) {
      const member = await FamilyMember.findOne({
        where: { id: permissionData.familyMemberId, userId: granterUserId }
      })

      if (!member) {
        throw new AppError('Family member not found', 404)
      }
    }

    // Check if permission already exists
    const existingPermission = await HealthPermission.findOne({
      where: {
        granterUserId,
        granteeUserId: permissionData.granteeUserId,
        familyMemberId: permissionData.familyMemberId || null,
        isActive: true
      }
    })

    if (existingPermission) {
      throw new AppError('Health permission already exists', 400)
    }

    const permission = await HealthPermission.create({
      ...permissionData,
      granterUserId
    })

    return permission
  }

  async getHealthPermissions(userId, pagination, type = 'granted') {
    const { limit, offset } = pagination
    let where = {}

    if (type === 'granted') {
      where.granterUserId = userId
    } else if (type === 'received') {
      where.granteeUserId = userId
    } else {
      throw new AppError('Invalid permission type. Use "granted" or "received"', 400)
    }

    where.isActive = true

    const { count, rows } = await HealthPermission.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: type === 'granted' ? 'grantee' : 'granter',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: FamilyMember,
          as: 'familyMember',
          attributes: ['id', 'name', 'relationship'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      permissions: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  async updateHealthPermission(granterUserId, permissionId, updateData) {
    const permission = await HealthPermission.findOne({
      where: { id: permissionId, granterUserId }
    })

    if (!permission) {
      throw new AppError('Health permission not found', 404)
    }

    await permission.update(updateData)
    return permission
  }

  async revokeHealthPermission(granterUserId, permissionId) {
    const permission = await HealthPermission.findOne({
      where: { id: permissionId, granterUserId }
    })

    if (!permission) {
      throw new AppError('Health permission not found', 404)
    }

    await permission.update({ isActive: false })
    return { message: 'Health permission revoked successfully' }
  }

  // Check if user has permission to access family member's data
  async checkHealthPermission(granteeUserId, granterUserId, familyMemberId = null, requiredPermission = 'view') {
    const permission = await HealthPermission.findOne({
      where: {
        granterUserId,
        granteeUserId,
        familyMemberId: familyMemberId || null,
        isActive: true
      }
    })

    if (!permission) {
      return false
    }

    // Check if permission has expired
    if (permission.expiresAt && new Date() > permission.expiresAt) {
      await permission.update({ isActive: false })
      return false
    }

    // Check permission level
    const permissionLevels = {
      view: ['view', 'manage', 'full'],
      manage: ['manage', 'full'],
      full: ['full']
    }

    return permissionLevels[requiredPermission]?.includes(permission.permissionLevel) || false
  }

  // Shared Medical History (with permissions)
  async getSharedMedicalHistory(granteeUserId, granterUserId, familyMemberId = null, pagination) {
    // Check permission
    const hasPermission = await this.checkHealthPermission(granteeUserId, granterUserId, familyMemberId, 'view')
    
    if (!hasPermission) {
      throw new AppError('You do not have permission to access this medical history', 403)
    }

    const { limit, offset } = pagination
    const where = {
      isShared: true,
      sharedWith: { [Op.contains]: [granteeUserId] }
    }

    if (familyMemberId) {
      where.familyMemberId = familyMemberId
    } else {
      where.userId = granterUserId
    }

    const { count, rows } = await MedicalHistory.findAndCountAll({
      where,
      include: [
        {
          model: FamilyMember,
          as: 'familyMember',
          attributes: ['id', 'name', 'relationship'],
          required: false
        }
      ],
      order: [['recordDate', 'DESC']],
      limit,
      offset
    })

    return {
      history: rows,
      pagination: buildPaginationMeta(count, pagination.page, pagination.limit)
    }
  }

  // Helper method to get user's family member IDs
  async getUserFamilyMemberIds(userId) {
    const members = await FamilyMember.findAll({
      where: { userId },
      attributes: ['id']
    })

    return members.map(member => member.id)
  }
}

module.exports = new FamilyService()