import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [success, setSuccess] = useState(null);
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    dispatch(clearError());
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    if (!formData.identifier.trim() || !formData.password.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      console.log('Login dispatch result:', result);
      setSuccess('Login successful! Redirecting...');
      toast.success('Login successful!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Login dispatch error:', err);
      const errorMessage = err.status === 404
        ? 'User not found'
        : err.status === 400
        ? 'Invalid email/phone number or password'
        : 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0CE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 overflow-hidden"
      >
        <div className="absolute inset-0 border-4 border-transparent rounded-2xl bg-gradient-to-r from-[#0174BE] to-[#0C356A] opacity-20 pointer-events-none"></div>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0C356A', color: '#FFF0CE', border: '1px solid #0174BE' } }} />
        <h2 className="text-3xl font-bold text-[#0C356A] mb-6 text-center">Login</h2>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 mb-6 text-center font-medium flex items-center justify-center"
            >
              <AlertCircle size={20} className="mr-2" />
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-500 mb-6 text-center font-medium flex items-center justify-center"
            >
              <CheckCircle size={20} className="mr-2" />
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <label className="block text-[#0C356A] font-medium mb-2" htmlFor="identifier">
              <Mail size={18} className="inline mr-2" /> Email or Phone Number
            </label>
            <input
              type="text"
              name="identifier"
              id="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
              required
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <label className="block text-[#0C356A] font-medium mb-2" htmlFor="password">
              <Lock size={18} className="inline mr-2" /> Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
              required
            />
          </motion.div>
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className="w-full bg-[#0174BE] text-[#FFF0CE] p-3 rounded-lg font-semibold hover:bg-[#0C356A] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;