const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../logs/monitor_logs.json');
let monitoringStatus = new Map();
let endpointStats = new Map();

const loadLogs = async () => {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveLogs = async (logs) => {
  await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2));
};

const updateEndpointStatus = async (endpoint, status) => {
  // Update current status
  monitoringStatus.set(endpoint.name, {
    ...status,
    lastCheck: moment().format(),
    endpoint
  });

  // Update stats
  const stats = endpointStats.get(endpoint.name) || { success: 0, error: 0 };
  if (status.success) {
    stats.success++;
  } else {
    stats.error++;
  }
  endpointStats.set(endpoint.name, stats);

  // Save log
  const logs = await loadLogs();
  logs.unshift({
    timestamp: new Date().toISOString(),
    endpoint: endpoint.name,
    success: status.success,
    responseTime: status.responseTime,
    error: status.error
  });

  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.pop();
  }

  await saveLogs(logs);
  
  // Emit status update via Socket.IO
  const { io } = require('./server');
  io.emit('statusUpdate', {
    endpoint: endpoint.name,
    status: {
      ...status,
      stats: endpointStats.get(endpoint.name)
    }
  });
};

const getMonitoringStatus = async () => {
  return Object.fromEntries(monitoringStatus);
};

const getEndpointStats = () => {
  return Object.fromEntries(endpointStats);
};

const getLogs = async (limit = 100) => {
  const logs = await loadLogs();
  return logs.slice(0, limit);
};

module.exports = {
  updateEndpointStatus,
  getMonitoringStatus,
  getEndpointStats,
  getLogs
}; 