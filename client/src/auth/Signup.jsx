import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    permanentAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
    additionalAddresses: [],
  });
  const [additionalAddress, setAdditionalAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [success, setSuccess] = useState(null);
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'postalCode', 'country'].includes(name)) {
      setFormData({
        ...formData,
        permanentAddress: { ...formData.permanentAddress, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    dispatch(clearError());
    setSuccess(null);
  };

  const handleAdditionalAddressChange = (e) => {
    const { name, value } = e.target;
    setAdditionalAddress({ ...additionalAddress, [name]: value });
  };

  const addAdditionalAddress = () => {
    if (
      additionalAddress.street &&
      additionalAddress.city &&
      additionalAddress.state &&
      additionalAddress.postalCode &&
      additionalAddress.country
    ) {
      setFormData({
        ...formData,
        additionalAddresses: [...formData.additionalAddresses, additionalAddress],
      });
      setAdditionalAddress({ street: '', city: '', state: '', postalCode: '', country: '' });
      toast.success('Additional address added');
    } else {
      toast.error('Please fill all additional address fields');
    }
  };

  const removeAdditionalAddress = (index) => {
    setFormData({
      ...formData,
      additionalAddresses: formData.additionalAddresses.filter((_, i) => i !== index),
    });
    toast.success('Additional address removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    // Client-side validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.password.trim() ||
      !formData.permanentAddress.street ||
      !formData.permanentAddress.city ||
      !formData.permanentAddress.state ||
      !formData.permanentAddress.postalCode ||
      !formData.permanentAddress.country
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    // Basic phone number validation (encourage country code)
    if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.trim())) {
      toast.error('Phone number must be 10-15 digits, starting with an optional + (e.g., +9771234567890)');
      return;
    }

    try {
      const result = await dispatch(signupUser(formData)).unwrap();
      console.log('Signup dispatch result:', result);
      setSuccess('Signup successful! Redirecting to login...');
      toast.success('Signup successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Signup dispatch error:', err);
      // Handle backend validation errors
      const errorMessage =
        err.status === 400 && err.errors
          ? Object.values(err.errors).join(', ') // Display specific validation errors
          : err.status === 404
          ? 'Signup service unavailable. Please try again later.'
          : err.message || 'Failed to sign up';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0CE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 overflow-hidden"
      >
        <div className="absolute inset-0 border-4 border-transparent rounded-2xl bg-gradient-to-r from-[#0174BE] to-[#0C356A] opacity-20 pointer-events-none"></div>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0C356A', color: '#FFF0CE', border: '1px solid #0174BE' } }} />
        <h2 className="text-3xl font-bold text-[#0C356A] mb-6 text-center">Sign Up</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="firstName">
                <User size={18} className="inline mr-2" /> First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="lastName">
                <User size={18} className="inline mr-2" /> Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="username">
                <User size={18} className="inline mr-2" /> Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="email">
                <Mail size={18} className="inline mr-2" /> Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="phoneNumber">
                <Phone size={18} className="inline mr-2" /> Phone Number (e.g., +9771234567890)
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+9771234567890"
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Include country code (e.g., +977 for Nepal)</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-4">
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
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="mb-4 col-span-1 sm:col-span-2">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="street">
                <MapPin size={18} className="inline mr-2" /> Permanent Address - Street
              </label>
              <input
                type="text"
                name="street"
                id="street"
                value={formData.permanentAddress.street}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="city">
                <MapPin size={18} className="inline mr-2" /> City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.permanentAddress.city}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="state">
                <MapPin size={18} className="inline mr-2" /> State
              </label>
              <input
                type="text"
                name="state"
                id="state"
                value={formData.permanentAddress.state}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="postalCode">
                <MapPin size={18} className="inline mr-2" /> Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                value={formData.permanentAddress.postalCode}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="mb-4">
              <label className="block text-[#0C356A] font-medium mb-2" htmlFor="country">
                <MapPin size={18} className="inline mr-2" /> Country
              </label>
              <input
                type="text"
                name="country"
                id="country"
                value={formData.permanentAddress.country}
                onChange={handleChange}
                className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="mb-4 col-span-1 sm:col-span-2">
              <label className="block text-[#0C356A] font-medium mb-2">
                <MapPin size={18} className="inline mr-2" /> Additional Address
              </label>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="street"
                    value={additionalAddress.street}
                    onChange={handleAdditionalAddressChange}
                    placeholder="Street"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  />
                  <input
                    type="text"
                    name="city"
                    value={additionalAddress.city}
                    onChange={handleAdditionalAddressChange}
                    placeholder="City"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  />
                  <input
                    type="text"
                    name="state"
                    value={additionalAddress.state}
                    onChange={handleAdditionalAddressChange}
                    placeholder="State"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={additionalAddress.postalCode}
                    onChange={handleAdditionalAddressChange}
                    placeholder="Postal Code"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  />
                  <input
                    type="text"
                    name="country"
                    value={additionalAddress.country}
                    onChange={handleAdditionalAddressChange}
                    placeholder="Country"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={addAdditionalAddress}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-[#0174BE] text-[#FFF0CE] p-3 rounded-lg font-semibold hover:bg-[#0C356A] transition-colors"
                >
                  Add Address
                </motion.button>
              </div>
            </motion.div>
            {formData.additionalAddresses.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="mb-4 col-span-1 sm:col-span-2">
                <label className="block text-[#0C356A] font-medium mb-2">
                  <MapPin size={18} className="inline mr-2" /> Added Addresses
                </label>
                {formData.additionalAddresses.map((addr, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={`${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`}
                      className="w-full p-3 border border-[#0174BE] rounded-lg bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                    <motion.button
                      type="button"
                      onClick={() => removeAdditionalAddress(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-500 text-white p-2 rounded-lg"
                    >
                      Remove
                    </motion.button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className="w-full bg-[#0174BE] text-[#FFF0CE] p-3 rounded-lg font-semibold hover:bg-[#0C356A] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;