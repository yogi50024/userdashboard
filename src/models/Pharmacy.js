const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Pharmacy = sequelize.define('Pharmacy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isDeliveryAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deliveryRadius: {
    type: DataTypes.INTEGER, // in km
    defaultValue: 10
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'pharmacies'
})

const Medication = sequelize.define('Medication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genericName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: true
  },
  form: {
    type: DataTypes.STRING, // tablet, capsule, syrup, etc.
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isPrescriptionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'medications'
})

const PrescriptionOrder = sequelize.define('PrescriptionOrder', {
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
  pharmacyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'pharmacies',
      key: 'id'
    }
  },
  prescriptionImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  medications: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryType: {
    type: DataTypes.ENUM('pickup', 'delivery'),
    defaultValue: 'delivery'
  },
  status: {
    type: DataTypes.ENUM('placed', 'verified', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'),
    defaultValue: 'placed'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prescription_orders'
})

module.exports = { Pharmacy, Medication, PrescriptionOrder }