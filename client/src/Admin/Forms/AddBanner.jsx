import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import APIEndPoints from '../../middleware/APIEndPoints';

const AddBanner = () => {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [link, setLink] = useState(''); // New state for optional link
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cloudinaryPresets = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  const handleImageChange = async (e) => {
    const file = e.target.files[0]; // Accept only the first file
    if (!file) return;

    setImagePreviews([]); // Clear previous previews
    setImages([]); // Clear previous images

    setImagePreviews([URL.createObjectURL(file)]);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryPresets);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
        formData
      );
      setImages([response.data.secure_url]); // Store only one URL
      toast.success('Image uploaded to Cloudinary!');
    } catch (err) {
      toast.error('Failed to upload image to Cloudinary');
      setImagePreviews([]); // Clear preview on failure
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImages([]);
    setImagePreviews([]);
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!images.length) {
      setError('At least one image is required');
      setLoading(false);
      toast.error('Please upload an image');
      return;
    }

    try {
      const url = APIEndPoints.Upload_banner.url;
      console.log('Sending request to:', url, 'with data:', { image: images, link });
      const response = await axios.post(url, { image: images, link }, { withCredentials: true });
      console.log('Backend response:', response.data);

      setSuccess('Banner uploaded successfully!');
      toast.success('Banner uploaded successfully!');
      setImages([]);
      setImagePreviews([]);
      setLink(''); // Clear link field
      setTimeout(() => navigate('/admin/management/banners'), 2000);
    } catch (err) {
      console.error('Backend error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to upload banner');
      toast.error(err.response?.data?.message || 'Failed to upload banner');
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
      <h2 className="text-2xl font-bold mb-6 text-fourth">Add New Banner</h2>

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
          <label htmlFor="images" className="block text-sm font-medium text-fourth">
            Banner Image
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="file"
              id="images"
              accept="image/*"
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
              Upload Image
            </label>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src={imagePreviews[0]}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={loading}
                >
                  <X size={12} />
                </button>
              </motion.div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-fourth">
            Link (Optional)
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter link URL (e.g., https://example.com)"
            disabled={loading}
          />
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
          {loading ? 'Uploading...' : 'Upload Banner'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddBanner;