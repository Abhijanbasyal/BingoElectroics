import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import APIEndPoints from '../../middleware/APIEndPoints';

const AddProducts = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const addProductApi = APIEndPoints.Add_product;
  const getCategoryApi = APIEndPoints.Get_categories;
  const cloudinaryPresets =  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  const cloudinaryName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME

  // console.log(addProductApi,getCategoryApi,cloudinaryPresets, cloudinaryName)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(getCategoryApi.url, {
          withCredentials: true,
        });
        setCategories(response.data.categories);
      } catch (err) {
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  // Handle image upload to Cloudinary
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);

    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', cloudinaryPresets);

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
            formData
          );
          return response.data.secure_url;
        })
      );
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success('Images uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!title.trim() || !price || !productQuantity || !category) {
      setError('Title, price, product quantity, and category are required');
      setLoading(false);
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await axios({
        method: addProductApi.method,
        url: addProductApi.url,
        data: {
          title,
          description,
          images,
          price: parseFloat(price),
          loyaltyPoints: parseInt(loyaltyPoints) || 0,
          productQuantity: parseInt(productQuantity),
          category,
        },
        withCredentials: true,
      });

      setSuccess('Product created successfully!');
      toast.success('Product created successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setLoyaltyPoints('');
      setProductQuantity('');
      setCategory('');
      setImages([]);
      setImagePreviews([]);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto p-6 bg-primary text-fourth rounded-lg shadow-lg"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-6 text-fourth">Add New Product</h2>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center"
        >
          <AlertCircle size={20} className="mr-2" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center"
        >
          <CheckCircle size={20} className="mr-2" />
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-fourth">
            Product Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter product title"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-fourth">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter product description"
            rows="4"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-fourth">
            Product Images (Max 5)
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
            <label
              htmlFor="images"
              className={`flex items-center justify-center w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 cursor-pointer hover:bg-tertiary/10 transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ImageIcon size={20} className="mr-2" />
              Upload Images
            </label>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={loading}
                  >
                    Click
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-fourth">
            Price
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter price"
            min="0"
            step="0.01"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="loyaltyPoints" className="block text-sm font-medium text-fourth">
            Loyalty Points (Optional)
          </label>
          <input
            type="number"
            id="loyaltyPoints"
            value={loyaltyPoints}
            onChange={(e) => setLoyaltyPoints(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter loyalty points"
            min="0"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="productQuantity" className="block text-sm font-medium text-fourth">
            Product Quantity
          </label>
          <input
            type="number"
            id="productQuantity"
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter product quantity"
            min="0"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-fourth">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
            loading ? 'bg-tertiary/50 cursor-not-allowed' : 'bg-tertiary hover:bg-tertiary/80'
          }`}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddProducts;