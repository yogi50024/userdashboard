const redis = require('redis')

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
})

client.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

client.on('connect', () => {
  console.log('Redis Client Connected')
})

module.exports = client