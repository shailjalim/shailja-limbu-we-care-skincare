jest.mock('../../config/db', () => ({
  getConnectionStatus: jest.fn(),
}));

const { getConnectionStatus } = require('../../config/db');
const { getTestMessage, getHealthStatus } = require('../../controllers/testController');

const createResponseMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('testController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  test('getTestMessage returns backend status and database summary', () => {
    getConnectionStatus.mockReturnValue({
      isConnected: true,
      status: 'connected',
      database: 'wecare',
    });

    const req = {};
    const res = createResponseMock();

    getTestMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Backend is running',
      timestamp: expect.any(String),
      database: {
        connected: true,
        status: 'connected',
        name: 'wecare',
      },
    }));
  });

  test('getHealthStatus returns healthy response with host information', () => {
    getConnectionStatus.mockReturnValue({
      isConnected: false,
      status: 'disconnected',
      database: null,
      host: null,
    });

    const req = {};
    const res = createResponseMock();

    getHealthStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      status: 'healthy',
      server: 'We Care API',
      uptime: expect.any(Number),
      timestamp: expect.any(String),
      environment: 'test',
      database: {
        connected: false,
        status: 'disconnected',
        name: null,
        host: null,
      },
    }));
  });

  test('getTestMessage returns 500 when the database status lookup fails', () => {
    getConnectionStatus.mockImplementation(() => {
      throw new Error('db failure');
    });

    const req = {};
    const res = createResponseMock();

    getTestMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error in test route',
      error: 'db failure',
    });
  });
});