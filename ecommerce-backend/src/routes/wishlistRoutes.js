import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { getWishlist, addToWishlist, removeFromWishlist, moveToCart } from '../controllers/wishlistController.js';

router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.delete('/:productId', protect, removeFromWishlist);
router.post('/move-to-cart', protect, moveToCart);

export default router;
