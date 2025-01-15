const cron = require('node-cron');
const { monitorEndpoint } = require('./services/monitor');
const { parseSchedule } = require('./utils/scheduleParser');
const { loadEndpointConfig } = require('./config/endpointConfig');
const { startWebServer } = require('./web/server');
require('dotenv').config();

const startMonitoring = async () => {
  const endpoints = await loadEndpointConfig();
  
  if (!endpoints.length) {
    console.error('No valid endpoints configured. Please check config/endpoints.json');
    return;
  }

  // Start web interface
  startWebServer(process.env.WEB_PORT || 3000);

  // สร้าง cron job สำหรับแต่ละ endpoint
  endpoints.forEach(endpoint => {
    const schedule = parseSchedule(endpoint.schedule || process.env.MONITOR_SCHEDULE);
    
    console.log(`Scheduling ${endpoint.name} with: ${endpoint.schedule || '5m (default)'}`);
    
    cron.schedule(schedule, async () => {
      console.log(`Running check for ${endpoint.name} at ${new Date().toLocaleString()}`);
      await monitorEndpoint(endpoint);
    });
  });

  console.log('API Monitoring Service Started');
};

startMonitoring().catch(console.error); 