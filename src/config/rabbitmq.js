const amqp = require('amqplib')

let connection = null
let channel = null

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE || 'user_dashboard'
const QUEUE_REMINDERS = process.env.RABBITMQ_QUEUE_REMINDERS || 'reminders'
const QUEUE_NOTIFICATIONS = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notifications'

async function initRabbitMQ() {
  try {
    const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://localhost'
    connection = await amqp.connect(rabbitMQUrl)
    channel = await connection.createChannel()

    // Create exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true })

    // Create queues
    await channel.assertQueue(QUEUE_REMINDERS, { durable: true })
    await channel.assertQueue(QUEUE_NOTIFICATIONS, { durable: true })

    // Bind queues to exchange
    await channel.bindQueue(QUEUE_REMINDERS, EXCHANGE_NAME, 'reminders.*')
    await channel.bindQueue(QUEUE_NOTIFICATIONS, EXCHANGE_NAME, 'notifications.*')

    console.log('RabbitMQ initialized successfully')
  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error)
    throw error
  }
}

async function publishMessage(routingKey, message) {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized')
  }

  const messageBuffer = Buffer.from(JSON.stringify(message))
  return channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
    persistent: true,
    timestamp: Date.now()
  })
}

async function consumeMessages(queueName, callback) {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized')
  }

  return channel.consume(queueName, async (msg) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString())
        await callback(content)
        channel.ack(msg)
      } catch (error) {
        console.error('Error processing message:', error)
        channel.nack(msg, false, false) // Don't requeue
      }
    }
  })
}

async function closeConnection() {
  if (channel) {
    await channel.close()
  }
  if (connection) {
    await connection.close()
  }
}

module.exports = {
  initRabbitMQ,
  publishMessage,
  consumeMessages,
  closeConnection,
  QUEUE_REMINDERS,
  QUEUE_NOTIFICATIONS
}