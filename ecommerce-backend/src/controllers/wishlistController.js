import asyncHandler from 'express-async-handler';
import Wishlist from '../models/wishlist.js';
import Product from '../models/product.js';
import { AppError } from '../utils/appError.js';

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name image price countInStock category',
  });

  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, items: [] });
    await wishlist.save();
  }

  const validItems = wishlist.items.filter((item) => item.product !== null);

  if (validItems.length !== wishlist.items.length) {
    wishlist.items = validItems;
    await wishlist.save();
  }

  res.json(wishlist);
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, items: [] });
  }

  const existingItem = wishlist.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    throw new AppError('Product already in wishlist', 400);
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

  const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: 'items.product',
    select: 'name image price countInStock category',
  });

  res.json(updatedWishlist);
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== productId
  );

  await wishlist.save();

  const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: 'items.product',
    select: 'name image price countInStock category',
  });

  res.json(updatedWishlist);
});

const moveToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.countInStock < qty) {
    throw new AppError('Insufficient stock', 400);
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (wishlist) {
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );
    await wishlist.save();
  }

  res.json({
    message: 'Product moved to cart',
    product: {
      _id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty,
    },
  });
});

export { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
