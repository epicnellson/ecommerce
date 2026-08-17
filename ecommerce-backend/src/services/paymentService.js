import Order from '../models/order.js';
import Product from '../models/product.js';
import { getStripe } from '../config/stripe.js';
import { calculateOrderPrices, formatPriceForStripe } from '../utils/pricingService.js';
import { fetchAndValidateProducts } from '../services/orderService.js';

function buildStripeLineItems(itemsToSave, taxPrice, shippingPrice) {
  const lineItems = itemsToSave.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
        metadata: {
          productId: item.product,
        },
      },
      unit_amount: formatPriceForStripe(item.price),
    },
    quantity: item.qty,
  }));

  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Shipping',
      },
      unit_amount: formatPriceForStripe(shippingPrice),
    },
    quantity: 1,
  });

  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Tax',
      },
      unit_amount: formatPriceForStripe(taxPrice),
    },
    quantity: 1,
  });

  return lineItems;
}

function buildMetadata(userId, itemsToSave, shippingAddress, paymentMethod, prices) {
  return {
    userId: userId.toString(),
    orderItems: JSON.stringify(itemsToSave),
    shippingAddress: JSON.stringify(shippingAddress),
    paymentMethod: paymentMethod,
    itemsPrice: prices.itemsPrice.toString(),
    taxPrice: prices.taxPrice.toString(),
    shippingPrice: prices.shippingPrice.toString(),
    totalPrice: prices.totalPrice.toString(),
  };
}

async function createCheckoutSessionData(userId, orderItems, shippingAddress, paymentMethod, frontendUrl) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  if (!orderItems || orderItems.length === 0) {
    throw new Error('No order items');
  }

  const itemsToSave = await fetchAndValidateProducts(orderItems);
  const prices = calculateOrderPrices(itemsToSave);

  const lineItems = buildStripeLineItems(itemsToSave, prices.taxPrice, prices.shippingPrice);
  const metadata = buildMetadata(userId, itemsToSave, shippingAddress, paymentMethod, prices);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${frontendUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/checkout?canceled=true`,
    metadata,
  });

  return { url: session.url, sessionId: session.id };
}

async function fulfillOrderFromSession(session) {
  const metadata = session.metadata;

  const orderItems = JSON.parse(metadata.orderItems);
  const shippingAddress = JSON.parse(metadata.shippingAddress);

  const order = new Order({
    user: metadata.userId,
    orderItems,
    shippingAddress,
    paymentMethod: metadata.paymentMethod,
    paymentResult: {
      id: session.payment_intent,
      status: session.payment_status,
      update_time: new Date().toISOString(),
      email_address: session.customer_details?.email,
    },
    itemsPrice: Number(metadata.itemsPrice),
    taxPrice: Number(metadata.taxPrice),
    shippingPrice: Number(metadata.shippingPrice),
    totalPrice: Number(metadata.totalPrice),
    isPaid: true,
    paidAt: new Date(),
  });

  const createdOrder = await order.save();

  const stockUpdates = orderItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { countInStock: -item.qty } },
    },
  }));

  await Product.bulkWrite(stockUpdates);

  return createdOrder;
}

async function getOrderFromSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    const existingOrder = await Order.findOne({ 'paymentResult.id': session.payment_intent });
    
    if (existingOrder) {
      return { order: existingOrder, status: 'paid' };
    }

    const order = await fulfillOrderFromSession(session);
    return { order, status: 'paid' };
  }

  return { status: session.payment_status };
}

async function processRefund(paymentIntentId, amount) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  if (!paymentIntentId) {
    throw new Error('No payment intent ID provided');
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: formatPriceForStripe(amount),
    });
    return refund;
  } catch (error) {
    console.error('Stripe refund error:', error.message);
    throw error;
  }
}

export {
  createCheckoutSessionData,
  fulfillOrderFromSession,
  getOrderFromSession,
  buildStripeLineItems,
  processRefund,
};
