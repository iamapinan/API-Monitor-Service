const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const moment = require('moment');
const { loadEndpointConfig } = require('../config/endpointConfig');
const { getMonitoringStatus, getEndpointStats, getLogs } = require('./statusManager');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Add moment to locals so it's available in all views
app.locals.moment = moment;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/css', express.static(path.join(__dirname, '../../node_modules/@fortawesome/fontawesome-free/css')));
app.use('/webfonts', express.static(path.join(__dirname, '../../node_modules/@fortawesome/fontawesome-free/webfonts')));

// Routes
app.get('/', async (req, res) => {
  const endpoints = await loadEndpointConfig();
  const status = await getMonitoringStatus();
  const endpointStats = getEndpointStats();
  res.render('dashboard', { endpoints, status, endpointStats });
});

app.get('/logs', async (req, res) => {
  const logs = await getLogs();
  // Format timestamps server-side
  const formattedLogs = logs.map(log => ({
    ...log,
    formattedTime: moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss')
  }));
  res.render('logs', { logs: formattedLogs });
});

// Status Monitor Route
app.get('/status/:endpointName', async (req, res) => {
  const endpoints = await loadEndpointConfig();
  const endpoint = endpoints.find(e => e.name === req.params.endpointName);
  
  if (!endpoint) {
    return res.status(404).render('404', { message: 'Endpoint not found' });
  }
  
  const logs = await getLogs();
  const endpointLogs = logs
    .filter(log => log.endpoint === endpoint.name)
    .map(log => ({
      ...log,
      formattedTime: moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss')
    }));
  
  const stats = getEndpointStats()[endpoint.name] || { success: 0, error: 0 };
  const status = (await getMonitoringStatus())[endpoint.name];
  
  res.render('status', { endpoint, logs: endpointLogs, stats, status });
});

// API Routes
app.get('/api/status', async (req, res) => {
  const status = await getMonitoringStatus();
  res.json(status);
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const startWebServer = (port = 3000) => {
  server.listen(port, () => {
    console.log(`Web interface running on http://localhost:${port}`);
  });
  return io;
};

module.exports = { startWebServer, io }; 