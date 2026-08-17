import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/payment/session-status?session_id=${sessionId}`);
        
        if (data.status === 'paid') {
          setOrder(data.order);
          clearCart();
          toast.success('Payment successful! Order placed.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkOrderStatus();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto px-4 py-16 text-center"
      >
        <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
        <p className="text-gray-600">Processing your payment...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-4 py-16 text-center"
      >
        <div className="text-red-500 text-xl mb-4">Payment Issue</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/checkout" className="text-blue-500 hover:underline">
          Try Again
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-4"
      >
        Order Placed Successfully!
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 mb-2"
      >
        Thank you for your purchase.
      </motion.p>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-sm text-gray-500 mb-4"
      >
        We've sent a confirmation email with your order details.
      </motion.p>
      {order && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-100 rounded-lg p-4 mt-6 text-left"
        >
          <p className="font-semibold mb-2">Order Details:</p>
          <p>Order ID: {order._id}</p>
          <p>Total: ${order.totalPrice}</p>
          <p>Status: {order.isPaid ? 'Paid' : 'Pending'}</p>
        </motion.div>
      )}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex gap-4 justify-center"
      >
        <Link to="/orders" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          View Orders
        </Link>
        <Link to="/" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default OrderSuccessPage;
