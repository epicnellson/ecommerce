import express from 'express';
import { body, param } from 'express-validator';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteReview,
  validateStock,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const productValidation = [
  body('name', 'Name is required').not().isEmpty().trim().escape(),
  body('price', 'Price must be a number greater than 0').isFloat({ min: 0.01 }),
  body('brand', 'Brand is required').not().isEmpty().trim().escape(),
  body('category', 'Category is required').not().isEmpty().trim().escape(),
  body('description', 'Description is required').not().isEmpty().trim(),
  body('image', 'Image URL is required').not().isEmpty().trim(),
  body('countInStock', 'Count in stock must be an integer >= 0').isInt({ min: 0 }),
];

router.route('/').get(getProducts).post(protect, admin, productValidation, createProduct);
router.route('/validate-stock').post(protect, validateStock);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, productValidation, updateProduct)
  .delete(protect, admin, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, deleteReview);

export default router;