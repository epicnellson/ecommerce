import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI (masked):', config.mongoUri?.replace(/\/\/.*:.*@/, '//***:***@'));
    
    mongoose.set('debug', true);
    
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    if (!process.env.JEST_WORKER_ID) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;