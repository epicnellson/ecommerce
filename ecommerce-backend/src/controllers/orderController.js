import asyncHandler from 'express-async-handler';
import Order from '../models/order.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import { createOrderWithTransaction } from '../services/orderService.js';
import { AppError } from '../utils/appError.js';
import { processRefund } from '../services/paymentService.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/emailService.js';

const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new AppError('No order items', 400);
  }

  const createdOrder = await createOrderWithTransaction(
    req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod
  );

  const user = await User.findById(req.user._id);
  if (user && user.email) {
    sendOrderConfirmationEmail({ name: user.name, email: user.email }, createdOrder).catch((err) =>
      console.error('Failed to send confirmation email:', err.message)
    );
  }

  res.status(201).json(createdOrder);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = req.body.isPaid !== undefined ? req.body.isPaid : order.isPaid;
    order.isDelivered = req.body.isDelivered !== undefined ? req.body.isDelivered : order.isDelivered;
    
    if (req.body.isPaid && !order.paidAt) {
      order.paidAt = new Date();
    }
    if (req.body.isDelivered && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    throw new AppError('Order not found', 404);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      throw new AppError('Not authorized to view this order', 401);
    }
    res.json(order);
  } else {
    throw new AppError('Order not found', 404);
  }
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  const isAdmin = req.user.isAdmin;

  if (!isOwner && !isAdmin) {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  if (order.isCancelled) {
    throw new AppError('Order is already cancelled', 400);
  }

  if (order.isDelivered) {
    throw new AppError('Cannot cancel a delivered order', 400);
  }

  if (order.isPaid && !isAdmin) {
    throw new AppError('Please contact support to cancel a paid order', 400);
  }

  order.isCancelled = true;
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || 'Cancelled by customer';

  const updatedOrder = await order.save();

  if (!order.isPaid) {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.qty } }
      );
    }
  }

  const user = await User.findById(order.user);
  if (user && user.email) {
    sendOrderStatusEmail({ name: user.name, email: user.email }, updatedOrder, 'cancelled').catch((err) =>
      console.error('Failed to send cancellation email:', err.message)
    );
  }

  res.json(updatedOrder);
});

const refundOrder = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    throw new AppError('Only administrators can process refunds', 403);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.isRefunded) {
    throw new AppError('Order is already refunded', 400);
  }

  if (!order.isPaid) {
    throw new AppError('Cannot refund an unpaid order', 400);
  }

  if (order.isCancelled) {
    throw new AppError('Cannot refund a cancelled order', 400);
  }

  try {
    if (order.paymentResult?.id) {
      await processRefund(order.paymentResult.id, order.totalPrice);
    }
  } catch (refundError) {
    console.error('Stripe refund failed:', refundError);
  }

  order.isRefunded = true;
  order.refundedAt = new Date();
  order.refundAmount = order.totalPrice;
  order.refundReason = req.body.reason || 'Refunded by admin';

  if (!order.isCancelled) {
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancellationReason = 'Refunded';
  }

  const updatedOrder = await order.save();

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { countInStock: item.qty } }
    );
  }

  const user = await User.findById(order.user);
  if (user && user.email) {
    sendOrderStatusEmail({ name: user.name, email: user.email }, updatedOrder, 'refunded').catch((err) =>
      console.error('Failed to send refund email:', err.message)
    );
  }

  res.json(updatedOrder);
});

export { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus, getOrderById, cancelOrder, refundOrder };
