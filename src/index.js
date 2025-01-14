const cron = require('node-cron');
const { monitorEndpoint } = require('./services/monitor');
const { parseSchedule } = require('./utils/scheduleParser');
require('dotenv').config();

const schedule = parseSchedule(process.env.MONITOR_SCHEDULE);

console.log(`Starting API Monitor with schedule: ${process.env.MONITOR_SCHEDULE || '5m (default)'}`);

cron.schedule(schedule, async () => {
  console.log(`Running API endpoint check at ${new Date().toLocaleString()}`);
  await monitorEndpoint();
});

console.log('API Monitoring Service Started'); 