const { reminderQueue } = require('./queues');

reminderQueue.process(async (job) => {
  console.log('Processing reminder for job:', job.data);
});
