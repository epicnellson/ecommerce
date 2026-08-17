import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaGoogle, FaFacebook, FaEnvelope, FaBox } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';
import { AuthCard, SocialButton, Divider, InputField, SubmitButton, AuthLink, ErrorAlert } from '../components/AuthComponents';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { syncWithDb, cartItems } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      toast.success('Welcome back! 🎉');
      
      if (cartItems.length > 0) {
        await syncWithDb();
      }
      
      navigate('/');
    } catch (err) {
      const message = getErrorMessage(err, 'auth');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <AuthCard title="Welcome Back" subtitle="Sign in to your account">
        {/* Social Login */}
        <div className="space-y-3">
          <SocialButton onClick={handleGoogleLogin} variant="google">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </SocialButton>
          
          <SocialButton onClick={handleFacebookLogin} variant="facebook">
            <FaFacebook className="text-lg" />
            Continue with Facebook
          </SocialButton>
        </div>

        <Divider text="or continue with email" />
        
        {/* Error Alert */}
        <ErrorAlert message={error} onDismiss={() => setError('')} />

        {/* Login Form */}
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
          
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon={FaLock}
          />

          <div className="flex items-center justify-end mb-6">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton loading={loading} disabled={loading}>
            Sign In
          </SubmitButton>
        </form>

        <AuthLink 
          text="Don't have an account?" 
          linkText="Create one" 
          to="/register" 
        />
      </AuthCard>
    </div>
  );
}

export default LoginPage;
