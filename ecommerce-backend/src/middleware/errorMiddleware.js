import { AppError } from '../utils/appError.js';
import { validationResult } from 'express-validator';

const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Middleware to handle express-validator validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError(errors.array()[0].msg, 400);
    return next(error);
  }
  next();
};

// Error code mapping for consistent API responses
const getErrorCode = (statusCode, message) => {
  const errorCodes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
  };
  
  const code = errorCodes[statusCode] || 'UNKNOWN_ERROR';
  
  // Add specific error identifiers based on message content
  if (message.toLowerCase().includes('token')) return `${code}_TOKEN`;
  if (message.toLowerCase().includes('password')) return `${code}_PASSWORD`;
  if (message.toLowerCase().includes('email')) return `${code}_EMAIL`;
  if (message.toLowerCase().includes('duplicate')) return `${code}_DUPLICATE`;
  if (message.toLowerCase().includes('validation')) return 'VALIDATION_ERROR';
  
  return code;
};

const errorHandler = (err, req, res, next) => {
  let error;
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let status = 'error';

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    status = err.status;
  } 
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    status = 'fail';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    status = 'fail';
  }
  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
    status = 'fail';
  }
  // Handle Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate field value: ${field}`;
    status = 'fail';
  }
  // Handle Mongoose validation error
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors || {}).map(val => val.message);
    message = messages.join('. ') || 'Validation error';
    status = 'fail';
  }
  // Handle regular Error objects
  else if (err instanceof Error) {
    message = err.message;
    if (statusCode >= 500) {
      status = 'error';
    } else {
      status = 'fail';
    }
  }

  // Ensure valid status code
  if (!statusCode || statusCode < 100 || statusCode >= 600) {
    statusCode = 500;
  }

  // Set status based on status code
  if (statusCode >= 400 && statusCode < 500) {
    status = 'fail';
  } else if (statusCode >= 500) {
    status = 'error';
  }

  // Generate consistent error code
  const errorCode = getErrorCode(statusCode, message);

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${statusCode} - ${errorCode}: ${message}`, {
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    status,
    code: errorCode,
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: {
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      }
    }),
  });
};

export { notFound, errorHandler, validateRequest };
