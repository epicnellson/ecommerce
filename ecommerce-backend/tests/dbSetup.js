import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import os from 'os';

let mongod = null;
let _dbAvailable = false;

export function isDbAvailable() {
  return _dbAvailable;
}

function isMongoBinaryCached() {
  const cacheDir = path.join(os.homedir(), '.cache', 'mongodb-memory-server', 'mongod');
  try {
    return fs.existsSync(cacheDir) && fs.readdirSync(cacheDir).length > 0;
  } catch {
    return false;
  }
}

export async function connectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    _dbAvailable = true;
    return true;
  }

  // Try real MongoDB first (fast timeout)
  try {
    const { default: config } = await import('../src/config/config.js');
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      socketTimeoutMS: 3000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    _dbAvailable = true;
    return true;
  } catch {
    // Real MongoDB unavailable
  }

  // Try in-memory only if binary is already cached
  if (isMongoBinaryCached()) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      _dbAvailable = true;
      return true;
    } catch {
      // In-memory also failed
    }
  }

  _dbAvailable = false;
  return false;
}

export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
  _dbAvailable = false;
}

export async function clearCollections() {
  if (mongoose.connection.readyState === 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}
