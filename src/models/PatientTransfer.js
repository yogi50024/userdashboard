const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const PatientTransfer = sequelize.define('PatientTransfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fromLocation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  toLocation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  transferType: {
    type: DataTypes.ENUM('ambulance', 'wheelchair', 'stretcher', 'regular'),
    allowNull: false
  },
  urgency: {
    type: DataTypes.ENUM('emergency', 'urgent', 'routine'),
    defaultValue: 'routine'
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  medicalCondition: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('requested', 'confirmed', 'assigned', 'in-transit', 'completed', 'cancelled'),
    defaultValue: 'requested'
  },
  driverInfo: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  vehicleInfo: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  actualCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'patient_transfers'
})

const Vaccination = sequelize.define('Vaccination', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ageGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  doses: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  intervalBetweenDoses: {
    type: DataTypes.INTEGER, // days
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'vaccinations'
})

const VaccinationBooking = sequelize.define('VaccinationBooking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  vaccinationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vaccinations',
      key: 'id'
    }
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  patientAge: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  patientRelation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  doseNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'administered', 'missed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  administeredBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificateUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nextDueDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'vaccination_bookings'
})

module.exports = { PatientTransfer, Vaccination, VaccinationBooking }