import mongoose from 'mongoose';
import Product from '../src/models/product.js';
import User from '../src/models/user.js';
import Order from '../src/models/order.js';
import { validateOrderItems, createOrder } from '../src/services/orderService.js';
import { connectTestDB, disconnectTestDB, clearCollections } from './dbSetup.js';

const dbOk = await connectTestDB();

afterEach(async () => {
  if (dbOk) await clearCollections();
});

afterAll(async () => {
  if (dbOk) await disconnectTestDB();
});

const describeIfDb = dbOk ? describe : describe.skip;

describe('validateOrderItems', () => {
  it('should validate non-empty order items', () => {
    expect(() => validateOrderItems([{ qty: 1 }])).not.toThrow();
  });

  it('should throw for empty array', () => {
    expect(() => validateOrderItems([])).toThrow('No order items');
  });

  it('should throw for null/undefined', () => {
    expect(() => validateOrderItems(null)).toThrow('No order items');
  });
});

describeIfDb('orderService integration', () => {
  let testUser;
  let testProduct;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

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

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const items = [{
        product: testProduct._id,
        qty: 2,
        name: testProduct.name,
        image: testProduct.image,
        price: testProduct.price,
      }];

      const order = await createOrder(
        testUser._id,
        items,
        { address: '123 Test St', city: 'Test City' },
        'paypal'
      );

      expect(order).toBeDefined();
      expect(order.user.toString()).toBe(testUser._id.toString());
      expect(order.orderItems.length).toBe(1);
      expect(order.orderItems[0].qty).toBe(2);
      expect(order.itemsPrice).toBe(100);
      expect(order.paymentMethod).toBe('paypal');
    });
  });
});
