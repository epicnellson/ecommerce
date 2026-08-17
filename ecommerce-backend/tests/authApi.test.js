import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/user.js';
import { connectTestDB, disconnectTestDB, clearCollections, isDbAvailable } from './dbSetup.js';

const dbOk = await connectTestDB();

afterEach(async () => {
  if (dbOk) await clearCollections();
});

afterAll(async () => {
  if (dbOk) await disconnectTestDB();
});

const describeIfDb = dbOk ? describe : describe.skip;

describeIfDb('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('New User');
    expect(res.body.email).toBe('newuser@example.com');
    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 for duplicate email', async () => {
    const userData = {
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123',
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test2@example.com',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Password');
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test3@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Name');
  });
});

describeIfDb('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'password123',
      });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('logintest@example.com');
  });

  it('should return 401 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid');
  });

  it('should return 401 for invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid');
  });

  it('should return 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123',
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
      });

    expect(res.status).toBe(400);
  });
});

describeIfDb('GET /api/auth/profile', () => {
  let authToken;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Profile Test User',
        email: 'profiletest@example.com',
        password: 'password123',
      });
    authToken = res.body.token;
  });

  it('should get user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', `jwt=${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Profile Test User');
    expect(res.body.email).toBe('profiletest@example.com');
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
  });
});
