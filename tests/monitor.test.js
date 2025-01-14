const { monitorEndpoint } = require('../src/services/monitor');
const axios = require('axios');
const { sendErrorEmail } = require('../src/services/emailService');
const { saveErrorLog, getLastErrorLog } = require('../src/services/logService');

jest.mock('axios');
jest.mock('../src/services/emailService');
jest.mock('../src/services/logService');
jest.mock('../config/endpoints', () => ({
  endpoints: [
    {
      name: 'Test API',
      url: 'https://test-api.com',
      expectedStatus: 200
    }
  ]
}));

describe('Monitor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not send email when API check is successful', async () => {
    axios.get.mockResolvedValue({ status: 200 });
    
    await monitorEndpoint();
    
    expect(sendErrorEmail).not.toHaveBeenCalled();
  });

  it('should send email only for new errors', async () => {
    const errorResponse = {
      response: {
        status: 500,
        statusText: 'Internal Server Error'
      }
    };
    
    axios.get.mockRejectedValue(errorResponse);
    getLastErrorLog.mockResolvedValueOnce(null);
    
    await monitorEndpoint();
    
    expect(sendErrorEmail).toHaveBeenCalledWith({
      subject: expect.stringContaining('Test API'),
      message: expect.stringContaining('Monitor: Test API')
    });
    expect(saveErrorLog).toHaveBeenCalled();

    jest.clearAllMocks();
    
    getLastErrorLog.mockResolvedValueOnce({
      status: 500,
      message: 'Status: 500, Message: Internal Server Error'
    });
    
    await monitorEndpoint();
    
    expect(sendErrorEmail).not.toHaveBeenCalled();
  });
}); 