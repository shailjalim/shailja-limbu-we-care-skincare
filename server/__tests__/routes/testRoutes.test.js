jest.mock('../../controllers/testController', () => ({
  getTestMessage: jest.fn((req, res) => res.status(200).json({ ok: 'test' })),
  getHealthStatus: jest.fn((req, res) => res.status(200).json({ ok: 'health' })),
}));

const express = require('express');
const request = require('supertest');
const router = require('../../routes/testRoutes');
const controller = require('../../controllers/testController');

describe('testRoutes', () => {
  test('wires /test route to getTestMessage controller', async () => {
    const app = express();
    app.use('/api', router);

    const response = await request(app).get('/api/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: 'test' });
    expect(controller.getTestMessage).toHaveBeenCalledTimes(1);
  });

  test('wires /health route to getHealthStatus controller', async () => {
    const app = express();
    app.use('/api', router);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: 'health' });
    expect(controller.getHealthStatus).toHaveBeenCalledTimes(1);
  });
});