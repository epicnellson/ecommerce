import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaShippingFast, FaCheckCircle, FaClock, FaArrowRight, FaReceipt, FaTimesCircle, FaUndo } from 'react-icons/fa';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by customer' });
      setOrders(orders.map(o => o._id === orderId ? data : o));
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'orders'));
    }
  };

  const getOrderStatus = (order) => {
    if (order.isRefunded) {
      return { label: 'Refunded', class: 'bg-purple-100 text-purple-700', icon: FaUndo };
    }
    if (order.isCancelled) {
      return { label: 'Cancelled', class: 'bg-red-100 text-red-700', icon: FaTimesCircle };
    }
    if (order.isDelivered) {
      return { label: 'Delivered', class: 'bg-green-100 text-green-700', icon: FaShippingFast };
    }
    if (order.isPaid) {
      return { label: 'Paid', class: 'bg-green-100 text-green-700', icon: FaCheckCircle };
    }
    return { label: 'Pending', class: 'bg-yellow-100 text-yellow-700', icon: FaClock };
  };

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
        ))}
      </div>
    </motion.div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6"
      >
        My Orders
      </motion.h1>
      
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-xl shadow-sm"
        >
          <FaBox className="text-6xl text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600"
          >
            Start Shopping <FaArrowRight />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">Order ID</span>
                    <span className="font-mono text-sm text-gray-900 truncate max-w-[150px] sm:max-w-none">
                      {order._id}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Order Body */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Items */}
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
                      <div className="space-y-1">
                        {order.orderItems.slice(0, 3).map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {item.qty} x {item.name}
                          </p>
                        ))}
                        {order.orderItems.length > 3 && (
                          <p className="text-sm text-gray-400">+{order.orderItems.length - 3} more items</p>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        order.isPaid 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.isPaid ? <FaCheckCircle /> : <FaClock />}
                        {order.isPaid ? 'Paid' : 'Pending Payment'}
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        order.isDelivered 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.isDelivered ? <FaShippingFast /> : <FaClock />}
                        {order.isDelivered ? 'Delivered' : 'Processing'}
                      </div>
                      {(order.isCancelled || order.isRefunded) && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          order.isRefunded 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {order.isRefunded ? <FaUndo /> : <FaTimesCircle />}
                          {order.isRefunded ? 'Refunded' : 'Cancelled'}
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900">${order.totalPrice}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-gray-500">
                      Payment: {order.paymentMethod}
                    </span>
                    <div className="flex items-center gap-2">
                      {!order.isCancelled && !order.isRefunded && !order.isDelivered && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <FaTimesCircle /> Cancel Order
                        </button>
                      )}
                      <Link
                        to={`/product/${order.orderItems[0]?.product}`}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                      >
                        View Details
                      </Link>
                    </div>
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

export default OrdersPage;
