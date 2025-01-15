const axios = require('axios');
const Ajv = require('ajv');
const { sendErrorEmail } = require('./emailService');
const { saveErrorLog, getLastErrorLog } = require('./logService');
const { updateEndpointStatus } = require('../web/statusManager');

const validateResponse = (response, validation) => {
  if (!validation) return true;

  // ตรวจสอบ response time
  if (validation.responseTime && response.responseTime > validation.responseTime) {
    throw new Error(`Response time ${response.responseTime}ms exceeded limit of ${validation.responseTime}ms`);
  }

  // ตรวจสอบ response schema
  if (validation.schema) {
    const ajv = new Ajv();
    const validate = ajv.compile(validation.schema);
    if (!validate(response.data)) {
      throw new Error(`Response schema validation failed: ${ajv.errorsText(validate.errors)}`);
    }
  }

  return true;
};

const monitorEndpoint = async (endpoint) => {
  try {
    console.log(`Checking endpoint: ${endpoint.name} (${endpoint.url})`);
    
    const startTime = Date.now();
    
    const response = await axios({
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers,
      params: endpoint.input?.params,
      data: endpoint.input?.body,
      validateStatus: null
    });

    response.responseTime = Date.now() - startTime;

    if (response.status !== endpoint.expectedStatus) {
      throw new Error(`API returned status code: ${response.status}`);
    }

    validateResponse(response, endpoint.validation);
    
    console.log(`[${endpoint.name}] API check successful (${response.responseTime}ms)`);
    
    updateEndpointStatus(endpoint, {
      success: true,
      responseTime: response.responseTime,
      data: response.data
    });

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
Method: ${endpoint.method}
Error: ${errorMessage}
Time: ${new Date().toLocaleString()}
${error.response?.data ? `Response: ${JSON.stringify(error.response.data, null, 2)}` : ''}
        `.trim()
      });
    } else {
      console.log(`[${endpoint.name}] Skipped notification - Same error as last time`);
    }

    updateEndpointStatus(endpoint, {
      success: false,
      error: errorMessage
    });
  }
};

module.exports = { monitorEndpoint }; 