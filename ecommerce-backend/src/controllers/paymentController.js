import asyncHandler from 'express-async-handler';
import { getStripe } from '../config/stripe.js';
import { createCheckoutSessionData, getOrderFromSession, fulfillOrderFromSession } from '../services/paymentService.js';
import { AppError } from '../utils/appError.js';

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!orderItems || orderItems.length === 0) {
    throw new AppError('No order items', 400);
  }

  const result = await createCheckoutSessionData(
    req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    frontendUrl
  );

  res.json(result);
});

const webhook = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new AppError('Stripe is not configured', 503);
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      await fulfillOrderFromSession(session);
      console.log(`Order created from webhook: ${session.id}`);
    } catch (err) {
      console.error(`Error fulfilling order: ${err.message}`);
      res.status(500).send('Error fulfilling order');
      return;
    }
  }

  res.json({ received: true });
});

const getSessionStatus = asyncHandler(async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    throw new AppError('Session ID required', 400);
  }

  const result = await getOrderFromSession(sessionId);
  res.json(result);
});

export { createCheckoutSession, webhook, getSessionStatus };
