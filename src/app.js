require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')

const { sequelize } = require('./config/database')
const redisClient = require('./config/redis')
const { initRabbitMQ } = require('./config/rabbitmq')
const errorHandler = require('./middleware/errorHandler')
const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('../package.json').version
  })
})

// API routes
app.use('/api/v1', routes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  })
})

// Error handling middleware
app.use(errorHandler)

// Initialize connections and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully.')

    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true })
      console.log('✅ Database synchronized.')
    }

    // Initialize Redis connection
    await redisClient.connect()
    console.log('✅ Redis connection established successfully.')

    // Initialize RabbitMQ connection
    await initRabbitMQ()
    console.log('✅ RabbitMQ connection established successfully.')

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...')
  await sequelize.close()
  await redisClient.quit()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...')
  await sequelize.close()
  await redisClient.quit()
  process.exit(0)
})

// Start the server only if this file is run directly
if (require.main === module) {
  startServer()
}

module.exports = app