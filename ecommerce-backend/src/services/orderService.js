import mongoose from 'mongoose';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { calculateOrderPrices } from '../utils/pricingService.js';

function validateOrderItems(orderItems) {
  if (!orderItems || orderItems.length === 0) {
    throw new Error('No order items');
  }
}

async function fetchAndValidateProducts(orderItems, session = null) {
  const productIds = orderItems.map((item) => item.product || item.productId);
  
  const query = Product.find({ _id: { $in: productIds } });
  if (session) {
    query.session(session);
  }
  
  const dbProducts = await query;
  
  const dbProductsMap = new Map(
    dbProducts.map((p) => [p._id.toString(), p])
  );

  const itemsToSave = orderItems.map((item) => {
    const id = item.product || item.productId;
    const dbProduct = dbProductsMap.get(id);

    if (!dbProduct) {
      throw new Error(`Product not found: ${id}`);
    }

    if (dbProduct.countInStock < item.qty) {
      throw new Error(`Insufficient stock for ${dbProduct.name}`);
    }

    return {
      product: id,
      qty: item.qty,
      name: dbProduct.name,
      image: dbProduct.image,
      price: dbProduct.price,
    };
  });

  return itemsToSave;
}

async function createOrder(userId, itemsToSave, shippingAddress, paymentMethod) {
  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calculateOrderPrices(itemsToSave);

  const order = new Order({
    user: userId,
    orderItems: itemsToSave,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  return order.save();
}

async function decrementStock(itemsToSave, session = null) {
  const stockUpdates = itemsToSave.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { countInStock: -item.qty } },
    },
  }));

  const query = Product.bulkWrite(stockUpdates);
  if (session) {
    query.session(session);
  }
  
  return query;
}

async function createOrderWithTransaction(userId, orderItems, shippingAddress, paymentMethod) {
  validateOrderItems(orderItems);

  const session = await mongoose.startSession();

  try {
    let createdOrder;
    await session.withTransaction(async () => {
      const itemsToSave = await fetchAndValidateProducts(orderItems, session);
      createdOrder = await createOrder(userId, itemsToSave, shippingAddress, paymentMethod, session);
      await decrementStock(itemsToSave, session);
    });

    return createdOrder;
  } finally {
    session.endSession();
  }
}

export {
  validateOrderItems,
  fetchAndValidateProducts,
  createOrder,
  decrementStock,
  createOrderWithTransaction,
  calculateOrderPrices,
};
