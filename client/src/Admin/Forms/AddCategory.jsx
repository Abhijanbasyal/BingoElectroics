import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import APIEndPoints from '../../middleware/APIEndPoints';

const AddCategory = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const addcatrgoryapi = APIEndPoints.Add_category;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios({
        method: addcatrgoryapi.method,
        url: addcatrgoryapi.url,
        data: { title, description },
        withCredentials: true,
      });

      setSuccess('Category created successfully!');
      setTitle('');
      setDescription('');
      setTimeout(() => {
        navigate('/admin'); // Redirect to admin dashboard after success
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
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
      <h2 className="text-2xl font-bold mb-6 text-fourth">Add New Category</h2>

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
            Category Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter category title"
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
            placeholder="Enter category description"
            rows="4"
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
          {loading ? 'Creating...' : 'Create Category'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddCategory;