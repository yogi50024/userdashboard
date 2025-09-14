const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const LabTest = sequelize.define('LabTest', {
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
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  preparationInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'lab_tests'
})

const LabBooking = sequelize.define('LabBooking', {
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
  testIds: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bookingType: {
    type: DataTypes.ENUM('home-collection', 'lab-visit'),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('booked', 'confirmed', 'sample-collected', 'processing', 'completed', 'cancelled'),
    defaultValue: 'booked'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  reportUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'lab_bookings'
})

const VirtualQueue = sequelize.define('VirtualQueue', {
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
  serviceType: {
    type: DataTypes.ENUM('doctor', 'lab', 'pharmacy', 'other'),
    allowNull: false
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  queueNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estimatedWaitTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  currentPosition: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('waiting', 'called', 'served', 'cancelled', 'no-show'),
    defaultValue: 'waiting'
  },
  calledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  servedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'virtual_queue'
})

module.exports = { LabTest, LabBooking, VirtualQueue }