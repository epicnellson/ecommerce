import asyncHandler from 'express-async-handler';
import Cart from '../models/cart.js';
import Product from '../models/product.js';
import { AppError } from '../utils/appError.js';

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, cartItems: [] });
    await cart.save();
  }

  res.json(cart);
});

const syncCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, cartItems: [] });
  }

  const productIds = cartItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const validItems = cartItems
    .filter((item) => productMap.has(item.product))
    .map((item) => {
      const product = productMap.get(item.product);
      return {
        product: item.product,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        qty: Math.min(item.qty, product.countInStock),
      };
    });

  const mergedMap = new Map();

  cart.cartItems.forEach((item) => {
    mergedMap.set(item.product.toString(), item);
  });

  validItems.forEach((item) => {
    const existing = mergedMap.get(item.product.toString());
    if (existing) {
      existing.qty = Math.min(existing.qty + item.qty, item.countInStock);
    } else {
      mergedMap.set(item.product.toString(), item);
    }
  });

  cart.cartItems = Array.from(mergedMap.values());
  await cart.save();

  res.json(cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.countInStock < qty) {
    throw new AppError('Insufficient stock', 400);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, cartItems: [] });
  }

  const existingItem = cart.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.qty = Math.min(existingItem.qty + qty, product.countInStock);
  } else {
    cart.cartItems.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      qty,
    });
  }

  await cart.save();
  res.json(cart);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.cartItems.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  if (qty <= 0) {
    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== productId
    );
  } else {
    item.qty = Math.min(qty, item.countInStock);
  }

  await cart.save();
  res.json(cart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  cart.cartItems = cart.cartItems.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  res.json(cart);
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.cartItems = [];
    await cart.save();
  }

  res.json({ message: 'Cart cleared' });
});

export { getCart, syncCart, addToCart, updateCartItem, removeFromCart, clearCart };
