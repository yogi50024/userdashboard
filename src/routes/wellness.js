const express = require('express')
const wellnessController = require('../controllers/wellnessController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { paginationValidation, uuidValidation } = require('../utils/validation')

const router = express.Router()

// Public routes (no authentication required)
router.get('/diet-plans', paginationValidation, handleValidationErrors, wellnessController.getDietPlans)
router.get('/diet-plans/:id', uuidValidation('id'), handleValidationErrors, wellnessController.getDietPlanById)
router.get('/exercise-programs', paginationValidation, handleValidationErrors, wellnessController.getExercisePrograms)
router.get('/exercise-programs/:id', uuidValidation('id'), handleValidationErrors, wellnessController.getExerciseProgramById)
router.get('/yoga-sessions', paginationValidation, handleValidationErrors, wellnessController.getYogaSessions)
router.get('/yoga-sessions/:id', uuidValidation('id'), handleValidationErrors, wellnessController.getYogaSessionById)

// Protected routes (authentication required)
router.use(authenticateToken)

// User Wellness Subscriptions
router.post('/subscriptions', handleValidationErrors, wellnessController.subscribeToWellness)
router.get('/subscriptions', paginationValidation, handleValidationErrors, wellnessController.getUserWellnessSubscriptions)
router.put('/subscriptions/:id', uuidValidation('id'), handleValidationErrors, wellnessController.updateWellnessSubscription)
router.post('/subscriptions/:id/pause', uuidValidation('id'), handleValidationErrors, wellnessController.pauseWellnessSubscription)
router.post('/subscriptions/:id/resume', uuidValidation('id'), handleValidationErrors, wellnessController.resumeWellnessSubscription)
router.delete('/subscriptions/:id', uuidValidation('id'), handleValidationErrors, wellnessController.cancelWellnessSubscription)
router.put('/subscriptions/:id/progress', uuidValidation('id'), handleValidationErrors, wellnessController.updateProgress)

// Recommendations
router.get('/recommendations/:type', paginationValidation, handleValidationErrors, wellnessController.getRecommendedContent)

module.exports = router