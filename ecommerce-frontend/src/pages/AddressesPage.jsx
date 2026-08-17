import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaStar, FaSave } from 'react-icons/fa';
import api from '../api/client';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorMessages';

function AddressesPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
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
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/auth/addresses');
      setAddresses(data.addresses || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'address'));
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({ ...addressForm, [name]: type === 'checkbox' ? checked : value });
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
      setShowForm(false);
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
    setShowForm(true);
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
    setShowForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/profile"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Address Book</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Manage your shipping addresses</p>
        <button
          onClick={openNewAddressForm}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaPlus /> Add Address
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Label
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressChange}
                placeholder="123 Main St, Apt 4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP / Postal Code
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
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
                Set as my default shipping address
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave /> {loading ? 'Saving...' : 'Save Address'}
              </motion.button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingAddress(null); }}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loadingAddresses ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading addresses...</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white rounded-xl p-5 border ${
                address.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span className="font-semibold text-gray-900">{address.name}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-600 text-sm">{address.street}</p>
                <p className="text-gray-600 text-sm">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-gray-600 text-sm">{address.country}</p>
                <p className="text-gray-500 text-sm mt-2">{address.phone}</p>
              </div>
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address._id)}
                  className="mt-4 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <FaStar size={12} /> Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <FaMapMarkerAlt className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No addresses saved yet</p>
          <p className="text-gray-400 text-sm mb-6">Add an address to speed up checkout</p>
          <button
            onClick={openNewAddressForm}
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium"
          >
            <FaPlus /> Add your first address
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default AddressesPage;
