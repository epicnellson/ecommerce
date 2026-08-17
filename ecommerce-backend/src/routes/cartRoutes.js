import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { getCart, syncCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';

router.route('/')
  .get(protect, getCart)
  .post(protect, syncCart);

router.post('/add', protect, addToCart);
router.put('/item', protect, updateCartItem);
router.delete('/item/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

export default router;
