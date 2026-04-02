const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Product = require('../models/Product');

let mongoServer;
let token;
let product;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create test user and get token
  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Routine Test User',
    email: 'routine@test.com',
    password: 'password123',
  });
  token = registerRes.body.user.token;

  // Add a product for routine steps
  product = await Product.create({
    name: 'Test Cleanser',
    price: 12.5,
    description: 'Gentle cleanser',
    category: 'Cleanser',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Routine API', () => {
  let routineId;

  test('should create routine successfully', async () => {
    const res = await request(app)
      .post('/api/routines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        routine_type: 'morning',
        steps: [
          { step_name: 'Cleanser', product_id: product._id },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.routine).toHaveProperty('_id');
    routineId = res.body.routine._id;
  });

  test('should not create routine with duplicate steps', async () => {
    const res = await request(app)
      .post('/api/routines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        routine_type: 'morning',
        steps: [
          { step_name: 'Cleanser', product_id: product._id },
          { step_name: 'Cleanser', product_id: product._id },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Duplicate step_name/);
  });

  test('should fetch routines for user', async () => {
    const res = await request(app)
      .get('/api/routines')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.routines)).toBe(true);
  });

  test('should update routine', async () => {
    const res = await request(app)
      .put(`/api/routines/${routineId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        routine_type: 'morning',
        steps: [{ step_name: 'Cleanser', product_id: product._id }],
        isActive: false,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.routine.isActive).toBe(false);
  });

  test('should delete routine', async () => {
    const res = await request(app)
      .delete(`/api/routines/${routineId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
