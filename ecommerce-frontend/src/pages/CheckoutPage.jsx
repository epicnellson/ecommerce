import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCreditCard, FaLock, FaShippingFast, FaCheckCircle, FaPlus, FaTrash, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import api from '../api/client';
import { toast } from 'react-toastify';

const ERROR_MESSAGES = {
  stockValidation: 'Unable to verify product availability. Please try again.',
  paymentInit: 'Unable to process payment. Please try again or contact support.',
  addressRequired: 'Please select or enter a shipping address.',
  network: 'Network error. Please check your connection and try again.',
};

function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Card');

  const shipping = cartTotal > 100 ? 0 : 10;
  const tax = cartTotal * 0.15;
  const total = cartTotal + shipping + tax;

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/auth/addresses');
      const addresses = data.addresses || [];
      setSavedAddresses(addresses);
      
      const defaultAddr = addresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setUseNewAddress(false);
      } else if (addresses.length > 0) {
        setSelectedAddressId(addresses[0]._id);
        setUseNewAddress(false);
      } else {
        setUseNewAddress(true);
      }
    } catch {
      setUseNewAddress(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const getSelectedAddress = () => {
    if (useNewAddress) {
      return shippingAddress;
    }
    const addr = savedAddresses.find(a => a._id === selectedAddressId);
    if (addr) {
      return {
        address: addr.street,
        city: addr.city,
        postalCode: addr.zipCode,
        country: addr.country || 'USA',
      };
    }
    return shippingAddress;
  };

  const validateForm = () => {
    const addr = getSelectedAddress();
    if (!addr.address || !addr.city || !addr.postalCode || !addr.country) {
      setError(ERROR_MESSAGES.addressRequired);
      toast.error(ERROR_MESSAGES.addressRequired);
      return false;
    }
    return true;
  };

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto px-4 py-16 text-center"
      >
        <FaShippingFast className="text-6xl text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to your cart to checkout.</p>
        <Link to="/" className="text-blue-500 hover:underline">Continue Shopping</Link>
      </motion.div>
    );
  }

  const validateStock = async () => {
    setValidating(true);
    setError('');
    
    try {
      const { data: products } = await api.post('/products/validate-stock', {
        items: cartItems.map((item) => ({ productId: item.product, qty: item.qty })),
      });

      const outOfStock = products.filter((p) => p.countInStock < p.requestedQty);
      
      if (outOfStock.length > 0) {
        const messages = outOfStock.map((p) => `${p.name}: only ${p.countInStock} available`);
        setError(`Stock issues: ${messages.join(', ')}`);
        toast.error('Some items are no longer available');
        return false;
      }

      return true;
    } catch {
      setError(ERROR_MESSAGES.stockValidation);
      toast.error(ERROR_MESSAGES.stockValidation);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const isValid = await validateStock();
    if (!isValid) return;

    setLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        qty: item.qty,
      }));

      const { data } = await api.post('/payment/create-checkout-session', {
        orderItems,
        shippingAddress: getSelectedAddress(),
        paymentMethod,
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err.response?.data?.message || ERROR_MESSAGES.paymentInit;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt /> Shipping Address
            </h2>
            
            {loadingAddresses ? (
              <div className="text-center py-4 text-gray-500">Loading addresses...</div>
            ) : savedAddresses.length > 0 && !useNewAddress ? (
              <div className="space-y-3 mb-4">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleAddressSelect(addr._id)}
                      className="mt-1 w-4 h-4 text-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-sm text-gray-500">{addr.country}</p>
                      {addr.phone && (
                        <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : null}

            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setUseNewAddress(!useNewAddress)}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
              >
                <FaPlus /> {useNewAddress ? 'Use a saved address' : 'Enter a new address'}
              </button>
            )}

            {useNewAddress && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={useNewAddress}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={useNewAddress}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={useNewAddress}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={useNewAddress}
                    />
                  </div>
                </div>
              </div>
            )}

            {savedAddresses.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No saved addresses yet.</p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
                >
                  <FaPlus /> Add an address in your profile
                </Link>
              </div>
            )}
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCreditCard /> Payment Method
            </h2>
            <label className="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50 rounded-xl cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="Card"
                checked={paymentMethod === 'Card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-500"
              />
              <FaCreditCard className="text-blue-500" />
              <span className="font-medium">Credit/Debit Card (Stripe)</span>
            </label>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <FaLock className="text-green-500" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </motion.div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.product} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.qty} x {item.name}</span>
                  <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || validating}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
            >
              {validating ? 'Validating...' : loading ? 'Processing...' : (
                <>
                  <FaLock /> Place Order
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}

export default CheckoutPage;
