import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Product from '../models/product.js';
import User from '../models/user.js';

dotenv.config();

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    brand: 'SoundMax',
    category: 'Electronics',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 149.99,
    countInStock: 25,
  },
  {
    name: 'Smart Watch Pro',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    brand: 'TechWear',
    category: 'Electronics',
    description: 'Advanced smartwatch with heart rate monitoring, GPS, and water resistance.',
    price: 299.99,
    countInStock: 15,
  },
  {
    name: 'Running Shoes Ultra',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    brand: 'SportX',
    category: 'Footwear',
    description: 'Lightweight running shoes with responsive cushioning for optimal performance.',
    price: 89.99,
    countInStock: 40,
  },
  {
    name: 'Cotton T-Shirt Classic',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    brand: 'BasicWear',
    category: 'Clothing',
    description: 'Soft, breathable cotton t-shirt available in multiple colors.',
    price: 19.99,
    countInStock: 100,
  },
  {
    name: 'Leather Backpack',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    brand: 'TravelCo',
    category: 'Accessories',
    description: 'Genuine leather backpack with laptop compartment and multiple pockets.',
    price: 129.99,
    countInStock: 20,
  },
  {
    name: 'Stainless Steel Water Bottle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    brand: 'EcoDrink',
    category: 'Accessories',
    description: 'Insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 24.99,
    countInStock: 50,
  },
  {
    name: 'Gaming Mouse RGB',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    brand: 'GamePro',
    category: 'Electronics',
    description: 'High-precision gaming mouse with customizable RGB lighting and programmable buttons.',
    price: 59.99,
    countInStock: 30,
  },
  {
    name: 'Yoga Mat Premium',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    brand: 'FlexFit',
    category: 'Sports',
    description: 'Non-slip yoga mat with alignment lines and carrying strap.',
    price: 34.99,
    countInStock: 35,
  },
];

const seedProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or get admin user
    let adminUser = await User.findOne({ email: 'admin@ecommerce.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@ecommerce.com',
        password: await bcrypt.hash('admin123', salt),
        isAdmin: true,
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user found');
    }

    // Add user ID to all products
    const productsWithUser = products.map((product) => ({
      ...product,
      user: adminUser._id,
    }));

    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Products cleared');

    console.log('Seeding products...');
    await Product.insertMany(productsWithUser);
    console.log(`${products.length} products seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
