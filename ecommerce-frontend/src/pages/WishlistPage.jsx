import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTrash, FaShoppingCart, FaBox, FaArrowRight } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

function WishlistPage() {
  const { wishlistItems, removeFromWishlist, moveToCart, loading, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [moving, setMoving] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (item) => {
    setMoving(item.product._id);
    const product = await moveToCart(item.product._id, 1);
    if (product) {
      addToCart(product, 1);
    }
    setMoving(null);
  };

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4 py-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3"
      >
        <FaHeart className="text-red-500" /> My Wishlist
        {wishlistItems.length > 0 && (
          <span className="text-lg font-normal text-gray-500">({wishlistItems.length} items)</span>
        )}
      </motion.h1>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-xl shadow-sm"
        >
          <FaHeart className="text-6xl text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600"
          >
            Browse Products <FaArrowRight />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.product?._id || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
              >
                <Link to={`/product/${item.product?._id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.product?.countInStock === 0 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link
                    to={`/product/${item.product?._id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-500 line-clamp-2"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="text-lg font-bold text-gray-900 mt-1">${item.product?.price}</p>
                  <p className={`text-xs mt-1 ${item.product?.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.product?.countInStock > 0 ? `${item.product?.countInStock} in stock` : 'Out of stock'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMoveToCart(item)}
                      disabled={moving === item.product?._id || item.product?.countInStock === 0}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <FaShoppingCart /> {moving === item.product?._id ? 'Moving...' : 'Add to Cart'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, color: '#ef4444' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(item.product?._id)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-500"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default WishlistPage;
