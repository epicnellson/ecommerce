import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaBox, FaSearch } from 'react-icons/fa';
import api from '../api/client';
import { toast } from 'react-toastify';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
          >
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-500 mt-1">{products.length} products total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/products/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          <FaPlus /> Add Product
        </motion.button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Brand</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="text-right px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 md:hidden">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{product.brand}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">${product.price}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.countInStock > 10
                          ? 'bg-green-100 text-green-700'
                          : product.countInStock > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, color: '#ef4444' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm ? 'No products match your search' : 'No products found'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminProductsPage;
