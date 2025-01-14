const fs = require('fs').promises;
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error_logs.json');

// สร้างโฟลเดอร์ logs ถ้ายังไม่มี
const ensureLogDir = async () => {
  try {
    await fs.access(LOG_DIR);
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true });
  }
};

// อ่าน error logs
const readErrorLogs = async () => {
  try {
    await ensureLogDir();
    const data = await fs.readFile(ERROR_LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// บันทึก error log
const saveErrorLog = async (errorData) => {
  const logs = await readErrorLogs();
  logs[errorData.endpoint] = {
    ...errorData,
    timestamp: new Date().toISOString()
  };
  
  await fs.writeFile(ERROR_LOG_FILE, JSON.stringify(logs, null, 2));
};

// ดึง error log ล่าสุดของ endpoint
const getLastErrorLog = async (endpointName) => {
  const logs = await readErrorLogs();
  return logs[endpointName];
};

module.exports = {
  saveErrorLog,
  getLastErrorLog
}; 