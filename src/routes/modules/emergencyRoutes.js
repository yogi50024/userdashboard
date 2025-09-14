const express = require('express');
const router = express.Router();
const emergencyController = require('../../controllers/emergencyController');

router.get('/', emergencyController.getEmergencies);

module.exports = router;
