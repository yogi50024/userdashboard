const redis = require('redis');

const redisClient = redis.createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
  await redisClient.connect();
};

module.exports = { redisClient, connectRedis };
