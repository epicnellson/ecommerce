import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaShoppingBag, FaArrowRight, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

function CartPage() {
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();

  const shipping = cartTotal > 100 ? 0 : 10;
  const tax = cartTotal * 0.15;
  const total = cartTotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-16 text-center"
      >
        <FaShoppingBag className="text-6xl text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          Start Shopping <FaArrowRight />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6"
      >
        Shopping Cart
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.product}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4"
              >
                <div className="flex gap-4">
                  <Link to={`/product/${item.product}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product}`}
                      className="text-sm sm:text-base font-semibold text-gray-900 hover:text-blue-500 truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-lg font-bold text-gray-900 mt-1">${item.price}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQty(item.product, item.qty - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                          <FaMinus className="text-xs" />
                        </motion.button>
                        <span className="w-10 text-center font-medium">{item.qty}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQty(item.product, item.qty + 1)}
                          disabled={item.qty >= item.countInStock}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FaPlus className="text-xs" />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, color: '#ef4444' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFromCart(item.product)}
                        className="text-red-500 text-sm font-medium flex items-center gap-1"
                      >
                        <FaTrash /> Remove
                      </motion.button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (15%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {shipping === 0 && (
              <p className="text-xs text-green-600 mt-2 bg-green-50 p-2 rounded-lg">
                You qualify for free shipping!
              </p>
            )}

            <Link
              to="/checkout"
              className="block w-full mt-6 text-center bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/"
              className="block w-full mt-3 text-center text-gray-500 text-sm hover:text-gray-700"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
