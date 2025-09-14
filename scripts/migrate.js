const { sequelize } = require('../src/config/database')
const models = require('../src/models')

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection established.')

    // Sync all models
    await sequelize.sync({ force: false, alter: true })
    console.log('✅ Database models synchronized.')

    console.log('🎉 Database migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
}

module.exports = migrate