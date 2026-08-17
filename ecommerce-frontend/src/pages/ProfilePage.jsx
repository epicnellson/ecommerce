import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaSave, FaCheck, FaTimes, FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';

function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [user, activeTab]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/auth/addresses');
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({ ...addressForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const { data } = await api.put('/auth/profile', updateData);
      
      login(data);
      setSuccess('Profile updated successfully');
      setFormData({ ...formData, password: '', confirmPassword: '' });
      toast.success('Profile updated successfully');
    } catch (err) {
      const message = getErrorMessage(err, 'profile');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAddress) {
        const { data } = await api.put(`/auth/addresses/${editingAddress}`, addressForm);
        setAddresses(data.addresses);
        toast.success('Address updated successfully');
      } else {
        const { data } = await api.post('/auth/addresses', addressForm);
        setAddresses(data.addresses);
        toast.success('Address added successfully');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        phone: '',
        isDefault: false,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'address'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address._id);
    setAddressForm({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'USA',
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const { data } = await api.delete(`/auth/addresses/${addressId}`);
      setAddresses(data.addresses);
      toast.success('Address deleted successfully');
    } catch (err) {
      toast.error(getErrorMessage(err, 'address'));
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const { data } = await api.put(`/auth/addresses/${addressId}/default`);
      setAddresses(data.addresses);
      toast.success('Default address updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'address'));
    }
  };

  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      phone: '',
      isDefault: false,
    });
    setShowAddressForm(true);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FaUser className="text-6xl text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'addresses'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Address Book
        </button>
      </div>

      {activeTab === 'profile' && (
        <>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
            >
              <FaTimes /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
            >
              <FaCheck /> {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="text-2xl text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    Administrator
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaUser className="text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaEnvelope className="text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <hr className="my-4" />

            <p className="text-sm text-gray-500">Leave password blank to keep your current password.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaLock className="text-gray-400" /> New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaLock className="text-gray-400" /> Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                minLength={6}
              />
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">My Addresses</h2>
            <div className="flex gap-2">
              <Link
                to="/profile/addresses"
                className="flex items-center gap-2 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Manage Addresses
              </Link>
              <button
                onClick={openNewAddressForm}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPlus /> Add Address
              </button>
            </div>
          </div>

          {showAddressForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Name</label>
                    <input
                      type="text"
                      name="name"
                      value={addressForm.name}
                      onChange={handleAddressChange}
                      placeholder="Home, Work, etc."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressChange}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    placeholder="123 Main St"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={addressForm.zipCode}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressChange}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaSave /> {loading ? 'Saving...' : 'Save Address'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {loadingAddresses ? (
            <div className="text-center py-8 text-gray-500">Loading addresses...</div>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`bg-white rounded-xl p-5 border ${
                    address.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span className="font-semibold text-gray-900">{address.name}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{address.street}</p>
                  <p className="text-gray-600 text-sm">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-gray-600 text-sm">{address.country}</p>
                  <p className="text-gray-500 text-sm mt-1">{address.phone}</p>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="mt-3 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      <FaStar size={12} /> Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FaMapMarkerAlt className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No addresses saved yet</p>
              <button
                onClick={openNewAddressForm}
                className="mt-3 text-blue-500 hover:text-blue-700"
              >
                Add your first address
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default ProfilePage;
