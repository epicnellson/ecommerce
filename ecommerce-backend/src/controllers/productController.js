import asyncHandler from 'express-async-handler';
import Product from '../models/product.js';
import { buildSearchQuery } from '../utils/regexSanitizer.js';

const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const keyword = req.query.keyword || '';
  const category = req.query.category || '';
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const minRating = req.query.minRating ? Number(req.query.minRating) : null;

  const query = {};

  const searchQuery = buildSearchQuery(keyword);
  if (searchQuery) {
    query.$or = searchQuery.$or;
  }

  if (category) {
    query.category = category;
  }

  if (minPrice !== null || maxPrice !== null) {
    query.price = {};
    if (minPrice !== null) query.price.$gte = minPrice;
    if (maxPrice !== null) query.price.$lte = maxPrice;
  }

  if (minRating !== null) {
    query.rating = { $gte: minRating };
  }

  const total = await Product.countDocuments(query);
  
  const products = await Product.find(query)
    .select('name image brand category price rating numReviews countInStock createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  }
  throw new Error('Resource not found');
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = new Product({
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    throw new Error('Resource not found');
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    throw new Error('Resource not found');
  }
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const existingReviewIndex = product.reviews.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReviewIndex > -1) {
      product.reviews[existingReviewIndex].rating = Number(rating);
      product.reviews[existingReviewIndex].comment = comment;
    } else {
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };
      product.reviews.push(review);
    }

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    const updatedProduct = await Product.findById(req.params.id);
    res.status(201).json({ 
      message: existingReviewIndex > -1 ? 'Review updated' : 'Review added',
      reviews: updatedProduct.reviews 
    });
  } else {
    throw new Error('Resource not found');
  }
});

const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId
    );

    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }

    if (product.reviews[reviewIndex].user.toString() !== req.user._id.toString()) {
      throw new Error('Not authorized to delete this review');
    }

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
      : 0;

    await product.save();
    res.json({ message: 'Review removed' });
  } else {
    throw new Error('Resource not found');
  }
});

const validateStock = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    throw new Error('No items to validate');
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).select('_id name countInStock');

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const results = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      return { productId: item.productId, name: 'Unknown', countInStock: 0, requestedQty: item.qty };
    }
    return {
      productId: product._id,
      name: product.name,
      countInStock: product.countInStock,
      requestedQty: item.qty,
    };
  });

  res.json(results);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteReview,
  validateStock,
};
