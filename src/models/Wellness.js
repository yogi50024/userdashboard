const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DietPlan = sequelize.define('DietPlan', {
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
    type: DataTypes.ENUM('weight-loss', 'weight-gain', 'diabetes', 'heart-healthy', 'general'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in days
    allowNull: false
  },
  meals: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  nutritionalInfo: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'diet_plans'
})

const ExerciseProgram = sequelize.define('ExerciseProgram', {
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
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('cardio', 'strength', 'flexibility', 'balance', 'mixed'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  exercises: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  equipment: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'exercise_programs'
})

const YogaSession = sequelize.define('YogaSession', {
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
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('hatha', 'vinyasa', 'ashtanga', 'yin', 'meditation', 'pranayama'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  poses: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  benefits: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'yoga_sessions'
})

const UserWellnessSubscription = sequelize.define('UserWellnessSubscription', {
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
  subscriptionType: {
    type: DataTypes.ENUM('diet', 'exercise', 'yoga', 'wellness-combo'),
    allowNull: false
  },
  resourceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  progress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'user_wellness_subscriptions'
})

module.exports = { DietPlan, ExerciseProgram, YogaSession, UserWellnessSubscription }