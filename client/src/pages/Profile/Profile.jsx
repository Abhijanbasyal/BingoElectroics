import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Award, Shield, MapPin, Camera } from 'lucide-react';
import { fetchCurrentUser, clearError } from '../../redux/authSlice';

const Profile = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    roles: '',
    points: 0,
    pointsRank: '',
    profilePicture: '',
    permanentAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
    additionalAddresses: []
  });

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        roles: user.roles || 'Customer',
        points: user.points || 0,
        pointsRank: user.pointsRank || '',
        profilePicture: user.profilePicture || '',
        permanentAddress: user.permanentAddress || { street: '', city: '', state: '', postalCode: '', country: '' },
        additionalAddresses: user.additionalAddresses || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    dispatch(clearError());
  };

  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 overflow-hidden"
      >
        <div className="absolute inset-0 border-4 border-transparent rounded-2xl bg-gradient-to-r from-tertiary to-fourth opacity-20 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-fourth mb-6 text-center">Your Profile</h2>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 mb-6 text-center font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-fourth font-medium"
          >
            Loading...
          </motion.p>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-24 h-24 rounded-full bg-tertiary/10 flex items-center justify-center overflow-hidden"
              >
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-tertiary" />
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="firstName"><User size={18} className="inline mr-2" /> First Name</label>
                <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="lastName"><User size={18} className="inline mr-2" /> Last Name</label>
                <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="username"><User size={18} className="inline mr-2" /> Username</label>
                <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="email"><Mail size={18} className="inline mr-2" /> Email</label>
                <input type="email" name="email" id="email" value={formData.email} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="phoneNumber"><Phone size={18} className="inline mr-2" /> Phone Number</label>
                <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="roles"><Shield size={18} className="inline mr-2" /> Role</label>
                <input type="text" name="roles" id="roles" value={formData.roles} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="points"><Award size={18} className="inline mr-2" /> Points</label>
                <input type="number" name="points" id="points" value={formData.points} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="mb-4">
                <label className="block text-fourth font-medium mb-2" htmlFor="pointsRank"><Award size={18} className="inline mr-2" /> Points Rank</label>
                <input type="text" name="pointsRank" id="pointsRank" value={formData.pointsRank} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" disabled />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="mb-4 col-span-1 sm:col-span-2">
                <label className="block text-fourth font-medium mb-2"><MapPin size={18} className="inline mr-2" /> Permanent Address</label>
                <input
                  type="text"
                  value={formatAddress(formData.permanentAddress)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </motion.div>
              {formData.additionalAddresses.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="mb-4 col-span-1 sm:col-span-2">
                  <label className="block text-fourth font-medium mb-2"><MapPin size={18} className="inline mr-2" /> Additional Addresses</label>
                  {formData.additionalAddresses.map((addr, index) => (
                    <input
                      key={index}
                      type="text"
                      value={formatAddress(addr)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 mb-2"
                      disabled
                    />
                  ))}
                </motion.div>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => navigate('/edit-profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-tertiary text-white p-3 rounded-lg font-semibold hover:bg-fourth transition-colors mt-6"
            >
              Edit Profile
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;