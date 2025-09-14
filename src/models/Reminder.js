const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Reminder = sequelize.define('Reminder', {
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
  type: {
    type: DataTypes.ENUM('medication', 'appointment', 'custom'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  frequency: {
    type: DataTypes.ENUM('once', 'daily', 'weekly', 'monthly'),
    defaultValue: 'once'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  notificationMethods: {
    type: DataTypes.JSONB,
    defaultValue: ['push']
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'missed'),
    defaultValue: 'active'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  snoozeUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'reminders',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['scheduledAt']
    },
    {
      fields: ['status']
    }
  ]
})

module.exports = Reminder