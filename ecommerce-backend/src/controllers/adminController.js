import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { AppError } from '../utils/appError.js';

const getOverview = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, totalProducts] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
  ]);

  const ordersWithTotal = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  const totalRevenue = ordersWithTotal[0]?.totalRevenue || 0;

  res.json({
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue,
  });
});

const getSalesData = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  let dateFilter = {};
  const now = new Date();

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    dateFilter = {
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    };
  } else {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = {
      createdAt: {
        $gte: thirtyDaysAgo,
        $lte: now,
      },
    };
  }

  const salesByDay = await Order.aggregate([
    { $match: { ...dateFilter, isPaid: true } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const salesData = salesByDay.map((day) => ({
    date: day._id,
    revenue: day.revenue,
    orders: day.orders,
  }));

  res.json(salesData);
});

const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  if (limit < 1 || limit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400);
  }

  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.qty' },
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.qty'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: 1,
        totalSold: 1,
        totalRevenue: 1,
      },
    },
  ]);

  res.json(topProducts);
});

const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;

  if (threshold < 1) {
    throw new AppError('Threshold must be a positive number', 400);
  }

  const lowStockProducts = await Product.find({
    countInStock: { $lt: threshold },
  })
    .select('name countInStock category')
    .sort({ countInStock: 1 })
    .limit(20);

  res.json(lowStockProducts);
});

const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  if (limit < 1 || limit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400);
  }

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(recentOrders);
});

export { getOverview, getSalesData, getTopProducts, getLowStockProducts, getRecentOrders };
