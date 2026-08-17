import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};

// Validate essential config
if (!config.mongoUri || !config.jwtSecret) {
  const msg = 'FATAL ERROR: MONGODB_URI and JWT_SECRET must be defined in .env file.';
  if (process.env.JEST_WORKER_ID) {
    throw new Error(msg);
  }
  console.error(msg);
  process.exit(1);
}

export default config;
