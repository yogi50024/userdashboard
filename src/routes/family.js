const express = require('express')
const familyController = require('../controllers/familyController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { paginationValidation, uuidValidation } = require('../utils/validation')

const router = express.Router()

// All family routes require authentication
router.use(authenticateToken)

// Family Members Management
router.post('/members', handleValidationErrors, familyController.createFamilyMember)
router.get('/members', paginationValidation, handleValidationErrors, familyController.getFamilyMembers)
router.get('/members/:id', uuidValidation('id'), handleValidationErrors, familyController.getFamilyMemberById)
router.put('/members/:id', uuidValidation('id'), handleValidationErrors, familyController.updateFamilyMember)
router.delete('/members/:id', uuidValidation('id'), handleValidationErrors, familyController.deleteFamilyMember)

// Medical History Management
router.post('/medical-history', handleValidationErrors, familyController.createMedicalHistory)
router.get('/medical-history', paginationValidation, handleValidationErrors, familyController.getMedicalHistory)
router.put('/medical-history/:id', uuidValidation('id'), handleValidationErrors, familyController.updateMedicalHistory)
router.delete('/medical-history/:id', uuidValidation('id'), handleValidationErrors, familyController.deleteMedicalHistory)

// Health Permissions Management
router.post('/permissions', handleValidationErrors, familyController.grantHealthPermission)
router.get('/permissions/granted', paginationValidation, handleValidationErrors, familyController.getGrantedHealthPermissions)
router.get('/permissions/received', paginationValidation, handleValidationErrors, familyController.getReceivedHealthPermissions)
router.put('/permissions/:id', uuidValidation('id'), handleValidationErrors, familyController.updateHealthPermission)
router.delete('/permissions/:id', uuidValidation('id'), handleValidationErrors, familyController.revokeHealthPermission)

// Shared Medical History
router.get('/shared-history/:granterUserId', uuidValidation('granterUserId'), paginationValidation, handleValidationErrors, familyController.getSharedMedicalHistory)
router.get('/shared-history/:granterUserId/:familyMemberId', uuidValidation('granterUserId'), uuidValidation('familyMemberId'), paginationValidation, handleValidationErrors, familyController.getSharedMedicalHistory)

module.exports = router