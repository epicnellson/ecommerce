import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/server.js';
import Product from '../src/models/product.js';
import User from '../src/models/user.js';
import { connectTestDB, disconnectTestDB, clearCollections } from './dbSetup.js';

const dbOk = await connectTestDB();

afterEach(async () => {
  if (dbOk) await clearCollections();
});

afterAll(async () => {
  if (dbOk) await disconnectTestDB();
});

const describeIfDb = dbOk ? describe : describe.skip;

describeIfDb('POST /api/orders', () => {
  let testUser;
  let testUserToken;
  let testProduct;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    testUserToken = loginRes.body.token;

    testProduct = await Product.create({
      user: testUser._id,
      name: 'Test Product',
      price: 50,
      image: 'http://example.com/image.jpg',
      brand: 'Test Brand',
      category: 'Electronics',
      description: 'Test description',
      countInStock: 10,
    });
  });

  it('should create an order successfully', async () => {
    const orderData = {
      orderItems: [
        {
          product: testProduct._id.toString(),
          qty: 2,
        }
      ],
      shippingAddress: {
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA',
      },
      paymentMethod: 'paypal',
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', `jwt=${testUserToken}`)
      .send(orderData);

    expect(res.status).toBe(201);
    expect(res.body.orderItems).toHaveLength(1);
    expect(res.body.orderItems[0].qty).toBe(2);
    expect(res.body.itemsPrice).toBe(100);
    expect(res.body.totalPrice).toBe(115.5);
  });

  it('should return 400 for empty order items', async () => {
    const orderData = {
      orderItems: [],
      shippingAddress: { address: '123 Test St' },
      paymentMethod: 'paypal',
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', `jwt=${testUserToken}`)
      .send(orderData);

    expect(res.status).toBe(400);
  });

  it('should return 401 without auth token', async () => {
    const orderData = {
      orderItems: [{ product: testProduct._id, qty: 1 }],
      shippingAddress: { address: '123 Test St' },
      paymentMethod: 'paypal',
    };

    const res = await request(app)
      .post('/api/orders')
      .send(orderData);

    expect(res.status).toBe(401);
  });

  it('should decrement stock after order', async () => {
    const orderData = {
      orderItems: [{ product: testProduct._id.toString(), qty: 2 }],
      shippingAddress: { address: '123 Test St', city: 'Test', state: 'TS', zipCode: '12345', country: 'USA' },
      paymentMethod: 'paypal',
    };

    await request(app)
      .post('/api/orders')
      .set('Cookie', `jwt=${testUserToken}`)
      .send(orderData);

    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.countInStock).toBe(8);
  });
});
