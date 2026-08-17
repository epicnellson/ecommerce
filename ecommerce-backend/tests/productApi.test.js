import request from 'supertest';
import mongoose from 'mongoose';
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

describeIfDb('GET /api/products', () => {
  let testUser;
  let testProducts;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    testProducts = await Product.insertMany([
      {
        user: testUser._id,
        name: 'iPhone 15',
        price: 999,
        image: 'http://example.com/iphone.jpg',
        brand: 'Apple',
        category: 'Electronics',
        description: 'Latest iPhone',
        countInStock: 10,
      },
      {
        user: testUser._id,
        name: 'Samsung Galaxy S24',
        price: 899,
        image: 'http://example.com/samsung.jpg',
        brand: 'Samsung',
        category: 'Electronics',
        description: 'Android flagship',
        countInStock: 5,
      },
      {
        user: testUser._id,
        name: 'MacBook Pro',
        price: 1999,
        image: 'http://example.com/macbook.jpg',
        brand: 'Apple',
        category: 'Computers',
        description: 'Professional laptop',
        countInStock: 3,
      },
    ]);
  });

  it('should return all products without keyword', async () => {
    const res = await request(app).get('/api/products');
    
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
  });

  it('should search products by keyword', async () => {
    const res = await request(app).get('/api/products?keyword=iPhone');
    
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('iPhone 15');
  });

  it('should search products by brand', async () => {
    const res = await request(app).get('/api/products?keyword=Apple');
    
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
  });

  it('should filter by category', async () => {
    const res = await request(app).get('/api/products?category=Computers');
    
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('MacBook Pro');
  });

  it('should filter by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=900&maxPrice=1000');
    
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
  });

  it('should sanitize malicious input', async () => {
    const res = await request(app).get('/api/products?keyword=<script>alert(1)</script>');
    
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });
});
