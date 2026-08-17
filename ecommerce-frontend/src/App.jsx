import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { useWishlist } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { 
  FaHome, FaShoppingCart, FaUser, FaBox, FaSignOutAlt, 
  FaUserShield, FaHeart, FaBars, FaTimes, FaChevronDown, FaSpinner,
  FaMapMarkerAlt
} from 'react-icons/fa';

const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminProductNewPage = lazy(() => import('./pages/AdminProductNewPage'));
const AdminProductEditPage = lazy(() => import('./pages/AdminProductEditPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="text-blue-500"
      >
        <FaSpinner className="text-3xl" />
      </motion.div>
    </div>
  );
}

function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const mobileMenuRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    hamburgerBtnRef.current?.focus();
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, closeMobileMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Focus trap and restore focus when menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      const firstFocusable = mobileMenuRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: '/', icon: FaHome, label: 'Home' },
    { to: '/cart', icon: FaShoppingCart, label: 'Cart', badge: cartCount, badgeColor: 'bg-blue-500' },
    ...(user ? [
      { to: '/wishlist', icon: FaHeart, label: 'Wishlist', badge: wishlistItems.length, badgeColor: 'bg-red-500' },
      { to: '/orders', icon: FaBox, label: 'Orders' },
      ...(user.isAdmin ? [{ to: '/admin', icon: FaUserShield, label: 'Admin', admin: true }] : []),
      { to: '/profile', icon: FaUser, label: 'Profile' },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <FaBox className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">ShopZone</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  link.admin 
                    ? 'text-purple-600 hover:bg-purple-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <link.icon className="text-sm" />
                {link.label}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className={`${link.badgeColor} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center`}>
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-500 text-sm" />
                  </div>
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                  <FaChevronDown className={`text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FaUser /> Profile
                      </Link>
                      <Link
                        to="/profile/addresses"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FaMapMarkerAlt /> Addresses
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FaBox /> My Orders
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            ref={hamburgerBtnRef}
            onClick={mobileMenuOpen ? closeMobileMenu : openMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-16 right-0 w-72 max-w-[85%] bg-white shadow-lg z-40 md:hidden rounded-bl-lg"
          >
            <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium ${
                    link.admin
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <link.icon className="text-lg" />
                    {link.label}
                  </span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className={`${link.badgeColor} text-white text-sm font-medium rounded-full px-2 py-0.5`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              {user ? (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/profile/addresses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <FaMapMarkerAlt className="text-lg" /> Addresses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt className="text-lg" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-4 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600"
                >
                  <FaUser className="text-lg" /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="min-h-[calc(100vh-4rem)]"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <OrdersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/addresses"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <AddressesPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/order/success" element={<OrderSuccessPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <WishlistPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboardPage />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminProductsPage />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminProductNewPage />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <AdminProductEditPage />
                </Suspense>
              </AdminRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <AnimatedRoutes />
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 ShopZone. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Built with MERN Stack</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
