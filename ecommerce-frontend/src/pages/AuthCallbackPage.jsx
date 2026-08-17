import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/client';
import { toast } from 'react-toastify';

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, checkAuth } = useAuth();
  const { syncWithDb, cartItems } = useCart();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const provider = searchParams.get('provider');
      const success = searchParams.get('success');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(decodeURIComponent(errorParam));
        toast.error(decodeURIComponent(errorParam));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (success === '1') {
        try {
          const { data } = await api.get('/auth/profile');
          login(data);
          toast.success(`Welcome${data.name ? `, ${data.name}` : ''}!`);
          
          if (cartItems.length > 0) {
            await syncWithDb();
          }
          
          setStatus('success');
          setTimeout(() => navigate('/'), 1500);
        } catch (err) {
          setStatus('error');
          setError('Failed to verify your account. Please try logging in.');
          toast.error('Failed to verify your account');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setStatus('error');
        setError('Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, login, cartItems, syncWithDb]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-md text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-blue-500 text-4xl mb-4"
            >
              <FaSpinner />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
            <p className="text-gray-500">Please wait while we verify your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500 text-5xl mb-4"
            >
              <FaCheckCircle />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
            <p className="text-gray-500">Redirecting you to home...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-red-500 text-5xl mb-4"
            >
              <FaTimesCircle />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-gray-500">{error}</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to login...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default AuthCallbackPage;
