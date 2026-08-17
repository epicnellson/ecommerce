import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import { getOverview, getSalesData, getTopProducts, getLowStockProducts, getRecentOrders } from '../controllers/adminController.js';

router.get('/stats/overview', protect, admin, getOverview);
router.get('/stats/sales', protect, admin, getSalesData);
router.get('/stats/top-products', protect, admin, getTopProducts);
router.get('/stats/low-stock', protect, admin, getLowStockProducts);
router.get('/orders/recent', protect, admin, getRecentOrders);

export default router;
