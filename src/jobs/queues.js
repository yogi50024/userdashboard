const Queue = require('bull');

const reminderQueue = new Queue('reminder');

module.exports = { reminderQueue };
