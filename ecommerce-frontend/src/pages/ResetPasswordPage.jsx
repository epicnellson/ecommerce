import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';
import { AuthCard, InputField, SubmitButton, ErrorAlert } from '../components/AuthComponents';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/auth/reset-password/${token}`);
        setIsValidToken(true);
      } catch (err) {
        setIsValidToken(false);
        setError('This reset link is invalid or has expired.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      login(data);
      toast.success('Password reset successful! 🎉');
      navigate('/');
    } catch (err) {
      const message = getErrorMessage(err, 'auth');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-blue-500 text-4xl"
        >
          <FaSpinner />
        </motion.div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaTimesCircle className="text-4xl text-red-500" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
            >
              <FaArrowLeft /> Request New Reset Link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <AuthCard title="Reset Password" subtitle="Enter your new password">
        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <InputField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon={FaLock}
            minLength={6}
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon={FaLock}
            minLength={6}
          />

          <div className="mt-6">
            <SubmitButton loading={loading} disabled={loading}>
              Reset Password
            </SubmitButton>
          </div>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-500 font-medium hover:text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}

export default ResetPasswordPage;
