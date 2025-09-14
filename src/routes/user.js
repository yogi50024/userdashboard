const express = require('express')
const multer = require('multer')
const path = require('path')
const userController = require('../controllers/userController')
const { authenticateToken } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only images are allowed'))
    }
  }
})

// All user routes require authentication
router.use(authenticateToken)

// Profile Management
router.get('/profile', userController.getUserProfile)
router.put('/profile', handleValidationErrors, userController.updateUserProfile)
router.put('/preferences', handleValidationErrors, userController.updateUserPreferences)
router.post('/profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture)
router.delete('/deactivate', userController.deactivateAccount)

// User Statistics
router.get('/stats', userController.getUserStats)

module.exports = router