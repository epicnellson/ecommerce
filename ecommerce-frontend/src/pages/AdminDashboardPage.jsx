import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaBox, FaDollarSign, FaShoppingBag, FaChartLine, FaEdit, FaTimesCircle, FaUndo } from 'react-icons/fa';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, salesRes, productsRes, ordersRes] = await Promise.all([
          api.get('/admin/stats/overview'),
          api.get('/admin/stats/sales'),
          api.get('/admin/stats/top-products?limit=5'),
          api.get('/admin/orders/recent?limit=10'),
        ]);

        setOverview(overviewRes.data);
        setSalesData(salesRes.data);
        setTopProducts(productsRes.data);
        setRecentOrders(ordersRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefundOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to refund this order? This will cancel the order and process a refund.')) return;
    
    try {
      const { data } = await api.put(`/orders/${orderId}/refund`, { reason: 'Refunded by admin' });
      setRecentOrders(recentOrders.map(o => o._id === orderId ? data : o));
      toast.success('Order refunded successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'orders'));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by admin' });
      setRecentOrders(recentOrders.map(o => o._id === orderId ? data : o));
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'orders'));
    }
  };

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaEdit /> Manage Products
          </Link>
          <Link
            to="/"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            <FaShoppingBag /> Back to Store
          </Link>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FaUsers className="text-blue-500 text-2xl" />
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{overview?.totalUsers || 0}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FaBox className="text-green-500 text-2xl" />
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{overview?.totalOrders || 0}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FaDollarSign className="text-yellow-500 text-2xl" />
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${(overview?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FaShoppingBag className="text-purple-500 text-2xl" />
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{overview?.totalProducts || 0}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine /> Sales (Last 30 Days)
          </h2>
          {salesData.length === 0 ? (
            <p className="text-gray-500">No sales data available</p>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {salesData.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.02, duration: 0.3 }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-t transition"
                  title={`${day.date}: $${day.revenue.toFixed(2)}`}
                ></motion.div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{salesData[0]?.date || 'N/A'}</span>
            <span>{salesData[salesData.length - 1]?.date || 'N/A'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-xl font-bold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No product data available</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.totalSold} sold
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    ${product.totalRevenue.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="py-2 text-sm truncate max-w-[100px]">
                      {order._id}
                    </td>
                    <td className="py-2 text-sm">
                      {order.user?.name || 'Unknown'}
                    </td>
                    <td className="py-2 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-sm font-medium">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-2 text-sm">
                      {order.isRefunded ? (
                        <span className="text-purple-600 font-medium">Refunded</span>
                      ) : order.isCancelled ? (
                        <span className="text-red-600 font-medium">Cancelled</span>
                      ) : order.isDelivered ? (
                        <span className="text-green-600">Delivered</span>
                      ) : order.isPaid ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </td>
                    <td className="py-2 text-sm">
                      <div className="flex items-center gap-2">
                        {!order.isCancelled && !order.isRefunded && order.isPaid && (
                          <button
                            onClick={() => handleRefundOrder(order._id)}
                            className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                            title="Refund Order"
                          >
                            <FaUndo /> Refund
                          </button>
                        )}
                        {!order.isCancelled && !order.isRefunded && !order.isDelivered && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                            title="Cancel Order"
                          >
                            <FaTimesCircle /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AdminDashboardPage;
