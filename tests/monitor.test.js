const { monitorEndpoint } = require('../src/services/monitor');
const axios = require('axios');
const { sendErrorEmail } = require('../src/services/emailService');
const { saveErrorLog, getLastErrorLog } = require('../src/services/logService');

jest.mock('axios');
jest.mock('../src/services/emailService');
jest.mock('../src/services/logService');

describe('Monitor Service', () => {
  const mockEndpoint = {
    name: 'Test API',
    url: 'https://test-api.com',
    method: 'POST',
    expectedStatus: 200,
    headers: { 'Content-Type': 'application/json' },
    input: {
      body: { test: 'data' }
    },
    validation: {
      responseTime: 1000,
      schema: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string' }
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate successful response', async () => {
    const mockResponse = {
      status: 200,
      data: { status: 'success' },
      responseTime: 500
    };
    
    axios.mockResolvedValue(mockResponse);
    
    await monitorEndpoint(mockEndpoint);
    
    expect(sendErrorEmail).not.toHaveBeenCalled();
  });

  it('should detect response time violations', async () => {
    const mockResponse = {
      status: 200,
      data: { status: 'success' },
      responseTime: 1500
    };
    
    axios.mockResolvedValue(mockResponse);
    
    await monitorEndpoint(mockEndpoint);
    
    expect(sendErrorEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('Test API'),
        message: expect.stringContaining('Response time')
      })
    );
  });

  it('should validate response schema', async () => {
    const mockResponse = {
      status: 200,
      data: { wrong: 'format' },
      responseTime: 500
    };
    
    axios.mockResolvedValue(mockResponse);
    
    await monitorEndpoint(mockEndpoint);
    
    expect(sendErrorEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('schema validation failed')
      })
    );
  });
}); 