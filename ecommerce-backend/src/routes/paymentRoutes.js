import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createCheckoutSession, webhook, getSessionStatus } from '../controllers/paymentController.js';

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/session-status', getSessionStatus);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

export default router;
