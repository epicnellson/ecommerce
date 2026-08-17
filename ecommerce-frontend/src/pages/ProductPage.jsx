import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShoppingCart, FaStar, FaBox, FaHeart, FaRegHeart, FaCheck, FaTruck, FaEdit, FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/Skeleton';
import api from '../api/client';

function ProductPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="h-14 bg-gray-200 rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );
}

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    
    try {
      const { data } = await api.post(`/products/${id}/reviews`, { rating, comment });
      setProduct({ ...product, reviews: data.reviews });
      setComment('');
      setRating(5);
      setEditingReview(null);
      setReviewSuccess(data.message);
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const userReview = product?.reviews?.find(r => r.user === user?._id);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-red-500 text-lg">{error}</p>
      <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">Go back home</Link>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-gray-500 text-lg">Product not found</p>
    </div>
  );

  const maxQty = product.countInStock;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
          <FaArrowLeft /> Back to products
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <motion.img
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              src={(product.images && product.images[selectedImage]) || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[product.image, ...(product.images || [])].map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.countInStock === 0 && (
            <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white font-medium rounded-lg">
              Out of Stock
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            {product.category}
          </p>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          
          <p className="text-gray-500">{product.brand}</p>

          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                    size={14}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>
          )}

          <p className="text-3xl font-bold text-gray-900">
            ${product.price}
          </p>

          <div className="flex items-center gap-2">
            {product.countInStock > 0 ? (
              <>
                <FaCheck className="text-green-500" />
                <span className="text-green-600 font-medium">
                  {product.countInStock} items in stock
                </span>
              </>
            ) : (
              <>
                <FaBox className="text-red-500" />
                <span className="text-red-500 font-medium">Currently unavailable</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <FaTruck />
            <span>Free shipping on orders over $100</span>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {product.countInStock > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(Math.min(maxQty, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWishlistToggle}
                  className={`ml-auto p-3 rounded-xl transition-colors ${
                    isInWishlist(product._id)
                      ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-500 hover:text-red-500'
                  }`}
                >
                  {isInWishlist(product._id) ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleAddToCart}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                <FaShoppingCart /> Add to Cart
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border-t pt-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

        {user ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {editingReview ? 'Edit Your Review' : userReview ? 'Your Review' : 'Write a Review'}
            </h3>
            
            {reviewSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{reviewSuccess}</div>
            )}
            {reviewError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{reviewError}</div>
            )}

            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <FaStar
                        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                        size={24}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  {editingReview ? 'Update Review' : userReview ? 'Update Review' : 'Submit Review'}
                </button>
                {editingReview && (
                  <button
                    type="button"
                    onClick={() => { setEditingReview(null); setComment(''); setRating(5); }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-center">
            <p className="text-gray-600">
              <Link to="/login" className="text-blue-500 hover:underline">Login</Link> to write a review
            </p>
          </div>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.slice().reverse().map((review) => (
              <div key={review._id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                            size={12}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {user && review.user === user._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ProductPage;
