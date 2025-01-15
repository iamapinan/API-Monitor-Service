const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');

const CONFIG_PATH = path.join(__dirname, '../../config/endpoints.json');

// Schema สำหรับ validate config
const configSchema = {
  type: 'object',
  required: ['endpoints'],
  properties: {
    endpoints: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'url', 'method', 'expectedStatus'],
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          schedule: { type: 'string', pattern: '^\\d+[smh]$' },
          expectedStatus: { type: 'number' },
          headers: { type: 'object' },
          input: {
            type: 'object',
            properties: {
              body: { type: 'object' },
              params: { type: 'object' }
            }
          },
          validation: {
            type: 'object',
            properties: {
              responseTime: { type: 'number' },
              schema: { type: 'object' }
            }
          }
        }
      }
    }
  }
};

const loadEndpointConfig = async () => {
  try {
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData);

    // Validate config
    const ajv = new Ajv();
    const validate = ajv.compile(configSchema);
    const valid = validate(config);

    if (!valid) {
      console.error('Invalid config format:', validate.errors);
      return [];
    }

    // Replace environment variables in config
    const processedConfig = JSON.parse(
      JSON.stringify(config).replace(
        /\${([^}]+)}/g,
        (_, key) => process.env[key] || ''
      )
    );

    return processedConfig.endpoints;
  } catch (error) {
    console.error('Error loading endpoint config:', error);
    return [];
  }
};

module.exports = { loadEndpointConfig }; 