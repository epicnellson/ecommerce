import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes, FaSpinner, FaHeart, FaRegHeart, FaFilter, FaStar } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { ProductGridSkeleton, PageLoader } from '../components/Skeleton';
import api from '../api/client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const page = Number(searchParams.get('page')) || 1;
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const [searchKeyword, setSearchKeyword] = useState(keyword);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [ratingMin, setRatingMin] = useState(minRating);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (keyword) params.append('keyword', keyword);
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (minRating) params.append('minRating', minRating);

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.products);
        setPagination({
          page: data.page,
          pages: data.pages,
          total: data.total,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, keyword, category, minPrice, maxPrice, minRating]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (selectedCategory) params.set('category', selectedCategory);
    if (priceMin) params.set('minPrice', priceMin);
    if (priceMax) params.set('maxPrice', priceMax);
    if (ratingMin) params.set('minRating', ratingMin);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClearFilters = useCallback(() => {
    setSearchKeyword('');
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setRatingMin('');
    setSearchParams({});
  }, [setSearchParams]);

  const handlePageChange = useCallback((newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  const handleWishlistToggle = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist]);

  const categories = useMemo(() => ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'], []);

  const hasActiveFilters = useMemo(() => 
    keyword || category || minPrice || maxPrice || minRating, 
  [keyword, category, minPrice, maxPrice, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search & Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border transition-colors flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaFilter /> Filters {hasActiveFilters && `(${[
                keyword ? 1 : 0,
                category ? 1 : 0,
                minPrice || maxPrice ? 1 : 0,
                minRating ? 1 : 0
              ].reduce((a, b) => a + b)})`}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
            >
              Search
            </motion.button>

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
              >
                <FaTimes /> Clear
              </motion.button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                  <select
                    value={ratingMin}
                    onChange={(e) => setRatingMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                {/* Active Filters Summary */}
                <div className="flex items-end">
                  <p className="text-sm text-gray-500">
                    {hasActiveFilters && `${pagination.total} products match your filters`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Results Info */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm text-gray-500"
        >
          Showing {products.length} of {pagination.total} products
          {hasActiveFilters && <span className="ml-1">(filtered)</span>}
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-red-500 text-lg mb-2">Something went wrong</p>
          <p className="text-gray-500">{error}</p>
        </motion.div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <button
            onClick={handleClearFilters}
            className="text-blue-500 hover:underline"
          >
            Clear filters and try again
          </button>
        </motion.div>
      ) : (
        <>
          {/* Products Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link
                  to={`/product/${product._id}`}
                  className="block bg-white rounded-md sm:rounded-lg shadow-sm hover:shadow-md sm:hover:shadow-lg transition-all duration-200 overflow-hidden group h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Wishlist Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleWishlistToggle(e, product)}
                      className={`absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 rounded-full shadow-md transition-colors ${
                        isInWishlist(product._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      {isInWishlist(product._id) ? <FaHeart size={10} className="sm:size-12" /> : <FaRegHeart size={10} className="sm:size-12" />}
                    </motion.button>
                    {/* Out of Stock Badge */}
                    {product.countInStock === 0 && (
                      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1 py-0.5 sm:px-1.5 sm:py-0.5 bg-red-500 text-white text-[8px] sm:text-[10px] font-medium rounded">
                        Out
                      </div>
                    )}
                    {/* Rating Badge */}
                    {product.rating > 0 && (
                      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 px-1 py-0.5 sm:px-1.5 sm:py-0.5 bg-black/50 text-white text-[8px] sm:text-[10px] font-medium rounded flex items-center gap-0.5">
                        <FaStar className="text-yellow-400 text-[6px] sm:text-[8px]" />
                        {product.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 sm:p-2 md:p-3">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5 hidden md:block">{product.category}</p>
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 truncate group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 hidden md:block">{product.brand}</p>
                    <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                      <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">${product.price}</p>
                      <p className={`text-[8px] sm:text-[10px] ${product.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.countInStock > 0 ? `${product.countInStock}` : 'Out'}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </motion.button>
              
              <div className="flex items-center gap-1">
                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isNearCurrent = Math.abs(pageNum - pagination.page) <= 2;
                  const isEndPage = pageNum === 1 || pageNum === pagination.pages;
                  
                  if (!isNearCurrent && !isEndPage) {
                    if (pageNum === 2 || pageNum === pagination.pages - 1) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
