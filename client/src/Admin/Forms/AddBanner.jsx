import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import APIEndPoints from '../../middleware/APIEndPoints';

const AddBanner = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cloudinaryPresets = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!image) {
      setError('Image is required');
      setLoading(false);
      toast.error('Please upload an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', cloudinaryPresets);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
        formData
      );
      const imageUrl = response.data.secure_url;

      await axios.post(APIEndPoints.Upload_banner.url, { image: imageUrl }, { withCredentials: true });

      setSuccess('Banner uploaded successfully!');
      toast.success('Banner uploaded successfully!');
      setImage(null);
      setImagePreview(null);
      setTimeout(() => navigate('/admin/management/banners'), 2000);
    } catch (err) {
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
          <label htmlFor="image" className="block text-sm font-medium text-fourth">
            Banner Image
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
            <label
              htmlFor="image"
              className={`flex items-center justify-center w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 cursor-pointer hover:bg-tertiary/10 transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ImageIcon size={20} className="mr-2" />
              Upload Image
            </label>
          </div>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-2 relative"
            >
              <img
                src={imagePreview}
                alt="Banner Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </motion.div>
          )}
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