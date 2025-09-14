const { body } = require('express-validator');

const createEmergencyValidator = [body('name').notEmpty().withMessage('Name is required')];

module.exports = { createEmergencyValidator };
