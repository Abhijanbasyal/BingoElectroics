import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Camera, Plus, Trash2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { fetchCurrentUser, clearError } from '../../redux/authSlice';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import APIEndPoints from '../../middleware/APIEndPoints';

const EditProfile = () => {
  const { user, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    profilePicture: '',
    permanentAddress: { street: '', city: '', state: '', postalCode: '', country: '' },
    additionalAddresses: []
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const cloudinaryPresets = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        password: '',
        profilePicture: user.profilePicture || '',
        permanentAddress: user.permanentAddress || { street: '', city: '', state: '', postalCode: '', country: '' },
        additionalAddresses: user.additionalAddresses || []
      });
      setImagePreview(user.profilePicture || null);
    }
  }, [user]);

  const handleInputChange = (e, index = null, field = null) => {
    const { name, value } = e.target;
    if (index !== null && field) {
      const newAddresses = [...formData.additionalAddresses];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      setFormData({ ...formData, additionalAddresses: newAddresses });
    } else if (name.includes('permanentAddress.')) {
      const fieldName = name.split('.')[1];
      setFormData({
        ...formData,
        permanentAddress: { ...formData.permanentAddress, [fieldName]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    dispatch(clearError());
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setImagePreview(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
      toast.error('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setImagePreview(preview);
    setUploadError(null);
    setUploadSuccess(null);

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', cloudinaryPresets);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
        formData
      );
      setFormData((prev) => ({ ...prev, profilePicture: response.data.secure_url }));
      setUploadSuccess('Image uploaded successfully!');
      toast.success('Image uploaded successfully!');
    } catch (err) {
      setUploadError('Failed to upload image');
      toast.error('Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, profilePicture: '' }));
    setUploadSuccess('Image removed');
    toast.success('Image removed');
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      additionalAddresses: [
        ...formData.additionalAddresses,
        { street: '', city: '', state: '', postalCode: '', country: '' }
      ]
    });
  };

  const removeAddress = (index) => {
    setFormData({
      ...formData,
      additionalAddresses: formData.additionalAddresses.filter((_, i) => i !== index)
    });
    toast.success('Address removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.username.trim() || 
        !formData.permanentAddress.street.trim() || !formData.permanentAddress.city.trim() || 
        !formData.permanentAddress.state.trim() || !formData.permanentAddress.postalCode.trim() || 
        !formData.permanentAddress.country.trim()) {
      setUploadError('All fields in permanent address, first name, last name, and username are required');
      toast.error('Please fill all required fields');
      return;
    }

    // Validate additional addresses if present
    for (let i = 0; i < formData.additionalAddresses.length; i++) {
      const addr = formData.additionalAddresses[i];
      if (!addr.street.trim() || !addr.city.trim() || !addr.state.trim() || 
          !addr.postalCode.trim() || !addr.country.trim()) {
        setUploadError(`All fields in additional address ${i + 1} are required`);
        toast.error(`Please fill all fields in additional address ${i + 1}`);
        return;
      }
    }

    // Log formData to debug
    console.log('Submitting formData:', JSON.stringify(formData, null, 2));

    setUploadLoading(true);
    try {
      const response = await axios({
        method: APIEndPoints.updateProfile.method,
        url: APIEndPoints.updateProfile.url,
        data: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true
      });

      setUploadSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully');
      dispatch(fetchCurrentUser());
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      console.error('Edit profile error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploadLoading(false);
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
        <Toaster position="top-right" toastOptions={{ style: { background: '#0C356A', color: '#FFF0CE', border: '1px solid #0174BE' } }} />
        <div className="absolute inset-0 border-4 border-transparent rounded-2xl bg-gradient-to-r from-[#0174BE] to-[#0C356A] opacity-20 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-[#0C356A] mb-6 text-center">Edit Profile</h2>

        <AnimatePresence>
          {(error || uploadError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-center"
            >
              <AlertCircle size={20} className="mr-2" />
              {error || uploadError}
            </motion.div>
          )}
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-center"
            >
              <CheckCircle size={20} className="mr-2" />
              {uploadSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[#0C356A] font-medium"
          >
            Loading...
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative w-24 h-24 rounded-full bg-[#0174BE]/10 flex items-center justify-center overflow-hidden"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-[#0174BE]" />
                )}
                <label
                  htmlFor="profilePicture"
                  className={`absolute bottom-0 right-0 bg-[#0174BE] text-[#FFF0CE] p-1 rounded-full cursor-pointer ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Camera size={16} />
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={uploadLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            </div>

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
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  placeholder="Enter first name"
                  required
                  disabled={uploadLoading}
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
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  placeholder="Enter last name"
                  required
                  disabled={uploadLoading}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-4 col-span-1 sm:col-span-2">
                <label className="block text-[#0C356A] font-medium mb-2" htmlFor="username">
                  <User size={18} className="inline mr-2" /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  placeholder="Enter username"
                  required
                  disabled={uploadLoading}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-4 col-span-1 sm:col-span-2">
                <label className="block text-[#0C356A] font-medium mb-2" htmlFor="password">
                  <Lock size={18} className="inline mr-2" /> New Password (optional)
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                  placeholder="Enter new password"
                  disabled={uploadLoading}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="mb-4 col-span-1 sm:col-span-2">
                <label className="block text-[#0C356A] font-medium mb-2">
                  <MapPin size={18} className="inline mr-2" /> Permanent Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="permanentAddress.street"
                    value={formData.permanentAddress.street}
                    onChange={handleInputChange}
                    placeholder="Street"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                    required
                    disabled={uploadLoading}
                  />
                  <input
                    type="text"
                    name="permanentAddress.city"
                    value={formData.permanentAddress.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                    required
                    disabled={uploadLoading}
                  />
                  <input
                    type="text"
                    name="permanentAddress.state"
                    value={formData.permanentAddress.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                    required
                    disabled={uploadLoading}
                  />
                  <input
                    type="text"
                    name="permanentAddress.postalCode"
                    value={formData.permanentAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal Code"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                    required
                    disabled={uploadLoading}
                  />
                  <input
                    type="text"
                    name="permanentAddress.country"
                    value={formData.permanentAddress.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                    required
                    disabled={uploadLoading}
                  />
                </div>
              </motion.div>
              {formData.additionalAddresses.map((addr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="mb-4 col-span-1 sm:col-span-2"
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[#0C356A] font-medium">
                      <MapPin size={18} className="inline mr-2" /> Additional Address {index + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={uploadLoading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={addr.street}
                      onChange={(e) => handleInputChange(e, index, 'street')}
                      placeholder="Street"
                      className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                      required
                      disabled={uploadLoading}
                    />
                    <input
                      type="text"
                      value={addr.city}
                      onChange={(e) => handleInputChange(e, index, 'city')}
                      placeholder="City"
                      className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                      required
                      disabled={uploadLoading}
                    />
                    <input
                      type="text"
                      value={addr.state}
                      onChange={(e) => handleInputChange(e, index, 'state')}
                      placeholder="State"
                      className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                      required
                      disabled={uploadLoading}
                    />
                    <input
                      type="text"
                      value={addr.postalCode}
                      onChange={(e) => handleInputChange(e, index, 'postalCode')}
                      placeholder="Postal Code"
                      className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                      required
                      disabled={uploadLoading}
                    />
                    <input
                      type="text"
                      value={addr.country}
                      onChange={(e) => handleInputChange(e, index, 'country')}
                      placeholder="Country"
                      className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE]"
                      required
                      disabled={uploadLoading}
                    />
                  </div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + formData.additionalAddresses.length * 0.1 }}
                className="mb-4 col-span-1 sm:col-span-2"
              >
                <button
                  type="button"
                  onClick={addAddress}
                  className="flex items-center text-[#0174BE] hover:text-[#0C356A]"
                  disabled={uploadLoading}
                >
                  <Plus size={18} className="mr-2" /> Add Another Address
                </button>
              </motion.div>
            </div>
            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => navigate('/profile')}
                whileHover={{ scale: uploadLoading ? 1 : 1.05 }}
                whileTap={{ scale: uploadLoading ? 1 : 0.95 }}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                disabled={uploadLoading}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: uploadLoading ? 1 : 1.05 }}
                whileTap={{ scale: uploadLoading ? 1 : 0.95 }}
                className={`flex-1 bg-[#0174BE] text-[#FFF0CE] p-3 rounded-lg font-semibold transition-colors ${uploadLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0C356A]'}`}
                disabled={uploadLoading}
              >
                {uploadLoading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EditProfile;