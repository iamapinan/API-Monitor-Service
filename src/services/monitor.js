const axios = require('axios');
const { sendErrorEmail } = require('./emailService');
const { endpoints } = require('../config/endpoints');
const { saveErrorLog, getLastErrorLog } = require('./logService');

const monitorEndpoint = async () => {
  if (!endpoints.length) {
    console.error('No endpoints configured. Skipping monitoring.');
    return;
  }

  for (const endpoint of endpoints) {
    if (!endpoint.url || !endpoint.name || !endpoint.expectedStatus) {
      console.error(`Skipping invalid endpoint configuration: ${endpoint.name || 'unnamed'}`);
      continue;
    }

    try {
      console.log(`Checking endpoint: ${endpoint.name} (${endpoint.url})`);
      const response = await axios.get(endpoint.url);
      
      if (response.status !== endpoint.expectedStatus) {
        throw new Error(`API returned status code: ${response.status}`);
      }
      
      console.log(`[${endpoint.name}] API check successful`);
      
    } catch (error) {
      const errorMessage = error.response 
        ? `Status: ${error.response.status}, Message: ${error.response.statusText}`
        : error.message;

      const errorSignature = {
        endpoint: endpoint.name,
        status: error.response?.status,
        message: errorMessage
      };

      const lastError = await getLastErrorLog(endpoint.name);
      
      if (!lastError || 
          lastError.status !== errorSignature.status || 
          lastError.message !== errorSignature.message) {
        
        console.error(`[${endpoint.name}] API check failed:`, errorMessage);
        
        await saveErrorLog(errorSignature);
        
        await sendErrorEmail({
          subject: `API Error Alert: ${endpoint.name}`,
          message: `
Monitor: ${endpoint.name}
URL: ${endpoint.url}
Error: ${errorMessage}
Time: ${new Date().toLocaleString()}
          `.trim()
        });
      } else {
        console.log(`[${endpoint.name}] Skipped notification - Same error as last time`);
      }
    }
  }
};

module.exports = { monitorEndpoint }; 