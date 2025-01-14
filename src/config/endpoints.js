const parseEndpoints = (endpointsString) => {
  if (!endpointsString) return [];
  
  return endpointsString.split(',').map(endpoint => {
    const [name, url, expectedStatus] = endpoint.split('|');
    return {
      name: name.trim(),
      url: url.trim(),
      expectedStatus: parseInt(expectedStatus.trim(), 10)
    };
  });
};

const endpoints = parseEndpoints(process.env.ENDPOINTS);

// ตรวจสอบความถูกต้องของ endpoints
if (!endpoints.length) {
  console.warn('Warning: No endpoints configured. Please check ENDPOINTS in .env file');
}

endpoints.forEach(endpoint => {
  if (!endpoint.url || !endpoint.name || !endpoint.expectedStatus) {
    console.error(`Invalid endpoint configuration for ${endpoint.name || 'unnamed endpoint'}`);
  }
});

module.exports = { endpoints }; 