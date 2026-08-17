import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import compression from 'compression';
import config from './config/config.js';
import connectDB from './config/db.js';
import initializePassport from './config/passport.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Initialize express app
const app = express();

// --- Rate Limiting ---
// Global rate limiter: 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// --- Core Middleware ---
// Set security HTTP headers
app.use(helmet());

// Enable CORS - allow localhost ports in development + configured FRONTEND_URL
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
    ];

    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Stripe webhook - needs raw body before JSON parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Apply global rate limiter
app.use('/api/', globalLimiter);

// Logger middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- Server Activation ---
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  initializePassport();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Auto-start only when executed directly, not when imported by tests
const isTestWorker = !!process.env.JEST_WORKER_ID;
if (!isTestWorker) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
