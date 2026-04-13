const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

const app = require('../server');
const User = require('../models/User');
const SkinProfile = require('../models/SkinProfile');
const Consultation = require('../models/Consultation');

let mongoServer;
let adminToken;
let userToken;
let userId;

const makeJpegBuffer = (size = 64) => Buffer.alloc(size, 1);

const createConsultationAsUser = async () => {
  const response = await request(app)
    .post('/api/consultations')
    .set('Authorization', `Bearer ${userToken}`)
    .field('title', 'Need acne guidance')
    .field('description', 'Persistent acne and irritation on cheeks');

  expect(response.statusCode).toBe(201);
  expect(response.body.success).toBe(true);
  return response.body.consultation;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const adminRegister = await request(app).post('/api/auth/register').send({
    name: 'Admin Tester',
    email: 'admin-consultation@test.com',
    password: 'password123',
    role: 'admin',
  });
  adminToken = adminRegister.body.user.token;

  const userRegister = await request(app).post('/api/auth/register').send({
    name: 'Premium User',
    email: 'premium-consultation@test.com',
    password: 'password123',
  });
  userToken = userRegister.body.user.token;
  userId = userRegister.body.user._id;

  await User.findByIdAndUpdate(userId, {
    subscription: {
      isActive: true,
      plan: 'monthly',
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    subscriptionStatus: 'premium',
    subscriptionPlan: 'monthly',
    subscriptionExpires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  await SkinProfile.create({
    user: userId,
    skinType: 'oily',
    concerns: ['acne'],
    allergies: ['fragrance'],
    sensitivityLevel: 'medium',
  });
});

afterEach(async () => {
  await Consultation.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Consultation upload validation integration', () => {
  test('accepts valid consultation image upload', async () => {
    const response = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Image upload test')
      .field('description', 'Checking upload behavior')
      .attach('images', makeJpegBuffer(), {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.consultation.images)).toBe(true);
    expect(response.body.consultation.images.length).toBe(1);
  });

  test('rejects non-image files', async () => {
    const response = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Invalid file type')
      .field('description', 'Should reject text files')
      .attach('images', Buffer.from('not-an-image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Only JPG, JPEG, and PNG image files are allowed/i);
  });

  test('rejects more than 3 images', async () => {
    const requestBuilder = request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Too many images')
      .field('description', 'Should reject more than 3 files');

    for (let index = 0; index < 4; index += 1) {
      requestBuilder.attach('images', makeJpegBuffer(), {
        filename: `image-${index}.jpg`,
        contentType: 'image/jpeg',
      });
    }

    const response = await requestBuilder;
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/up to 3 images/i);
  });

  test('rejects image larger than 2MB', async () => {
    const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1, 1);

    const response = await request(app)
      .post('/api/consultations')
      .set('Authorization', `Bearer ${userToken}`)
      .field('title', 'Oversized image')
      .field('description', 'Should reject large images')
      .attach('images', oversizedBuffer, {
        filename: 'large-image.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/2MB or smaller/i);
  });
});

describe('Admin consultation status transitions integration', () => {
  test('allows pending -> in-progress with admin reply and reply image upload', async () => {
    const consultation = await createConsultationAsUser();

    const response = await request(app)
      .put(`/api/admin/consultations/${consultation._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('status', 'in-progress')
      .field('adminReply', 'Please continue with gentle cleanser twice daily.')
      .attach('replyImages', makeJpegBuffer(), {
        filename: 'reply-image.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.consultation.status).toBe('in-progress');
    expect(response.body.consultation.adminReply).toMatch(/gentle cleanser/i);
    expect(Array.isArray(response.body.consultation.adminReplyImages)).toBe(true);
    expect(response.body.consultation.adminReplyImages.length).toBe(1);
  });

  test('allows in-progress -> completed transition', async () => {
    const consultation = await createConsultationAsUser();

    await request(app)
      .put(`/api/admin/consultations/${consultation._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('status', 'in-progress')
      .field('adminReply', 'Reviewing your case');

    const response = await request(app)
      .put(`/api/admin/consultations/${consultation._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('status', 'completed')
      .field('adminReply', 'Your consultation is complete.');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.consultation.status).toBe('completed');
  });

  test('rejects invalid admin status updates', async () => {
    const consultation = await createConsultationAsUser();

    const response = await request(app)
      .put(`/api/admin/consultations/${consultation._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('status', 'resolved');

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Status must be one of/i);
  });
});
