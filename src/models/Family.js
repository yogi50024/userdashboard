const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const FamilyMember = sequelize.define('FamilyMember', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  allergies: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  chronicConditions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  currentMedications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  emergencyContact: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  insuranceDetails: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isDependent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  canManageOwnHealth: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'family_members'
})

const MedicalHistory = sequelize.define('MedicalHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'family_members',
      key: 'id'
    }
  },
  recordType: {
    type: DataTypes.ENUM('diagnosis', 'surgery', 'allergy', 'medication', 'vaccination', 'test-result', 'other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recordDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hospitalName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isShared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sharedWith: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'medical_history'
})

const HealthPermission = sequelize.define('HealthPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  granterUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  granteeUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'family_members',
      key: 'id'
    }
  },
  permissionLevel: {
    type: DataTypes.ENUM('view', 'manage', 'full'),
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSONB,
    defaultValue: {
      viewMedicalHistory: false,
      manageAppointments: false,
      accessReports: false,
      emergencyAccess: false
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'health_permissions'
})

module.exports = { FamilyMember, MedicalHistory, HealthPermission }