import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
  refundOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/refund').put(protect, admin, refundOrder);

export default router;