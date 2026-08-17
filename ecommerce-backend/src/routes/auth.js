import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/errorMiddleware.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many registration attempts, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  message: { message: 'Too many reset attempts, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Helper function to handle OAuth success
const handleOAuthSuccess = (req, res, user, provider) => {
  generateToken(res, user._id);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/callback?provider=${provider}&success=1`);
};

// Helper function to handle OAuth error
const handleOAuthError = (req, res, error, provider) => {
  console.error(`OAuth ${provider} error:`, error);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const message = encodeURIComponent(error.message || 'Authentication failed');
  res.redirect(`${frontendUrl}/auth/callback?provider=${provider}&error=${message}`);
};

// Google OAuth Routes
router.get(
  '/google',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/callback?provider=google&error=Google OAuth not configured`);
    }
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    handleOAuthSuccess(req, res, req.user, 'google');
  },
  (err, req, res, next) => {
    handleOAuthError(req, res, err, 'google');
  }
);

// Facebook OAuth Routes
router.get(
  '/facebook',
  (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/callback?provider=facebook&error=Facebook OAuth not configured`);
    }
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  }
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    handleOAuthSuccess(req, res, req.user, 'facebook');
  },
  (err, req, res, next) => {
    handleOAuthError(req, res, err, 'facebook');
  }
);

// @route   POST /api/auth/register
router.post(
  '/register',
  registerLimiter,
  [
    body('name', 'Name is required').not().isEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').isLength({
      min: 6,
    }),
  ],
  registerUser
);

// @route   POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  loginUser
);

// @route   POST /api/auth/logout
router.post('/logout', logoutUser);

// Example of a protected route
router.get('/profile', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});

// @route   PUT /api/auth/profile
router.put(
  '/profile',
  protect,
  [
    body('name', 'Name is required').optional().not().isEmpty().trim(),
    body('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').optional().isLength({
      min: 6,
    }),
  ],
  updateUserProfile
);

// @route   GET /api/auth/addresses
router.get('/addresses', protect, getAddresses);

// @route   POST /api/auth/addresses
router.post(
  '/addresses',
  protect,
  [
    body('name', 'Name is required').not().isEmpty().trim(),
    body('street', 'Street is required').not().isEmpty().trim(),
    body('city', 'City is required').not().isEmpty().trim(),
    body('state', 'State is required').not().isEmpty().trim(),
    body('zipCode', 'Zip code is required').not().isEmpty().trim(),
    body('phone', 'Phone is required').not().isEmpty().trim(),
  ],
  addAddress
);

// @route   PUT /api/auth/addresses/:addressId
router.put(
  '/addresses/:addressId',
  protect,
  [
    body('name', 'Name is required').optional().not().isEmpty().trim(),
    body('street', 'Street is required').optional().not().isEmpty().trim(),
    body('city', 'City is required').optional().not().isEmpty().trim(),
    body('state', 'State is required').optional().not().isEmpty().trim(),
    body('zipCode', 'Zip code is required').optional().not().isEmpty().trim(),
    body('phone', 'Phone is required').optional().not().isEmpty().trim(),
  ],
  updateAddress
);

// @route   DELETE /api/auth/addresses/:addressId
router.delete('/addresses/:addressId', protect, deleteAddress);

// @route   PUT /api/auth/addresses/:addressId/default
router.put('/addresses/:addressId/default', protect, setDefaultAddress);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  forgotPassword
);

// @route   GET /api/auth/reset-password/:token
// @desc    Verify reset token
// @access  Public
router.get('/reset-password/:token', verifyResetToken);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password/:token',
  [
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  validateRequest,
  resetPassword
);

export default router;
