import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const UserForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: 'Customer',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    dispatch(clearError());
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Username, email, and password are required');
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const result = await dispatch(signupUser(formData));
      if (signupUser.fulfilled.match(result)) {
        setSuccess('User created successfully!');
        toast.success('User created successfully!');
        setFormData({ username: '', email: '', password: '', roles: 'Customer' });
        // setTimeout(() => {
        //   navigate('/admin');
        // }, 2000);
      } else {
        setError(result.error.message || 'Failed to create user');
        toast.error(result.error.message || 'Failed to create user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
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
      <h2 className="text-2xl font-bold mb-6 text-fourth">Add New User</h2>

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
          <label htmlFor="username" className="block text-sm font-medium text-fourth">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter username"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-fourth">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter email"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-fourth">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            placeholder="Enter password"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="roles" className="block text-sm font-medium text-fourth">
            Role
          </label>
          <select
            id="roles"
            name="roles"
            value={formData.roles}
            onChange={handleChange}
            className="mt-1 w-full p-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50"
            disabled={loading}
          >
            <option value="Customer">Customer</option>
            <option value="Seller">Seller</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
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
          {loading ? 'Creating...' : 'Create User'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default UserForm;