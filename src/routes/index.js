const express = require('express');
const router = express.Router();

// Import routes
const emergencyRoutes = require('./modules/emergencyRoutes');
// Add other routes here

router.use('/emergency', emergencyRoutes);
// Add other routes here

module.exports = router;
