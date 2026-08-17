import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import config from '../config/config.js';
import { AppError } from '../utils/appError.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Try to get token from cookie first
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Also check Authorization header as fallback
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    throw new AppError('Not authorized, no token', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (!decoded.userId) {
      throw new AppError('Invalid token payload', 401);
    }
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 401);
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    }
    throw new AppError('Not authorized, token failed', 401);
  }
});

const admin = (req, res, next) => {
  if (!req.user) {
    throw new AppError('Not authorized', 401);
  }
  if (!req.user.isAdmin) {
    throw new AppError('Not authorized as an admin', 403);
  }
  next();
};

export { protect, admin };
