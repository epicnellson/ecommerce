import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaImage, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import api from '../api/client';
import { toast } from 'react-toastify';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Accessories', 'Toys', 'Beauty', 'Food', 'Other'];

function AdminProductNewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    countInStock: '',
    image: '',
    images: [],
    description: '',
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const { data } = await api.post('/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData(prev => ({ ...prev, image: data.url }));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';
    if (!formData.category.trim()) return 'Category is required';
    if (!formData.brand.trim()) return 'Brand is required';
    if (formData.countInStock === '' || parseInt(formData.countInStock) < 0) return 'Valid stock quantity is required';
    if (!formData.image.trim()) return 'Main image URL is required';
    if (!formData.description.trim()) return 'Description is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        countInStock: parseInt(formData.countInStock),
        image: formData.image.trim(),
        images: formData.images,
        description: formData.description.trim(),
      };

      await api.post('/products', payload);
      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create product';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-6"
    >
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <FaArrowLeft /> Back to Products
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">Fill in the product details below</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        {/* Main Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image *</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <FaImage className="text-3xl text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
                >
                  <FaUpload /> {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Or enter image URL"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a file or paste an image URL</p>
            </div>
          </div>
        </div>

        {/* Additional Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/additional-image.jpg"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2"
            >
              <FaPlus /> Add
            </button>
          </div>
          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`Additional ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1-hover:opacity- opacity-0 group100 transition-opacity"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Enter brand name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 flex gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/admin/products')}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <FaSave /> {loading ? 'Creating...' : 'Create Product'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

export default AdminProductNewPage;
