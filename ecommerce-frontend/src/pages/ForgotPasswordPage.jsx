import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';
import { AuthCard, InputField, SubmitButton, ErrorAlert } from '../components/AuthComponents';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Check your email for reset instructions');
    } catch (err) {
      const message = getErrorMessage(err, 'auth');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheckCircle className="text-4xl text-green-500" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
            
            <p className="text-gray-600 mb-6">
              We sent password reset instructions to <br/>
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder, or{' '}
              <button 
                onClick={() => setSubmitted(false)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                try another email address
              </button>
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
            >
              <FaArrowLeft /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <AuthCard title="Forgot Password" subtitle="Enter your email to reset your password">
        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            icon={FaEnvelope}
          />

          <div className="mt-6">
            <SubmitButton loading={loading} disabled={loading}>
              Send Reset Link
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

export default ForgotPasswordPage;
