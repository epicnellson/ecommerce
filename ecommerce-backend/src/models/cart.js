import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    cartItems: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

cartSchema.methods.mergeWithLocalCart = function (localCartItems) {
  const mergedMap = new Map();
  
  this.cartItems.forEach((item) => {
    mergedMap.set(item.product.toString(), item);
  });
  
  localCartItems.forEach((item) => {
    const existing = mergedMap.get(item.product);
    if (existing) {
      existing.qty += item.qty;
    } else {
      mergedMap.set(item.product, {
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        countInStock: item.countInStock,
        qty: item.qty,
      });
    }
  });
  
  this.cartItems = Array.from(mergedMap.values());
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
