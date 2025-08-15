import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { fetchCurrentUser } from '../../redux/authSlice';
import { User, MapPin, Camera, Plus, Trash2, AlertCircle, CheckCircle, Mail, Phone, Award } from 'lucide-react';
import Loading from '../../components/LoadingComponent';
import getTableConfig from '../utils/tableConfig';
import APIEndPoints from '../../middleware/APIEndPoints';

const EditForm = () => {
  const { type: paramType, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [targetUserRole, setTargetUserRole] = useState(null);
  const userRole = user?.roles || 'Admin';

  const type = paramType === 'user' ? 'users' : paramType === 'category' ? 'categories' : paramType === 'banner' ? 'banners' : paramType;
  const tableConfig = useMemo(() => getTableConfig(userRole), [userRole]);
  const validTypes = Object.keys(tableConfig);
  const config = tableConfig[type];

  useEffect(() => {
    if (!validTypes.includes(type) || !id) {
      setError('Invalid type or ID');
      toast.error('Invalid type or ID');
      navigate(userRole === 'Manager' ? '/manager' : '/admin');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
        const endpoint = `${baseUrl}${config.endpoint}/${id}`;
        console.log(`Fetching data from: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          withCredentials: true,
        });

        const data = response.data[type] || response.data[type.slice(0, -1)] || response.data;
        if (!data) {
          throw new Error('Invalid data received');
        }

        if (type === 'users') {
          setTargetUserRole(data.roles);
        }

        setFormData({
          ...data,
          images: type === 'products' ? (Array.isArray(data.images) ? data.images : [data.images].filter(Boolean)) : data.images || [],
          image: type === 'banners' ? (Array.isArray(data.image) ? data.image[0] : data.image) : data.image,
          permanentAddress: data.permanentAddress || { street: '', city: '', state: '', postalCode: '', country: '' },
          additionalAddresses: data.additionalAddresses || [],
        });
        setError('');
        setSuccess('');

        if (type === 'products') {
          const categoriesResponse = await axios.get(`${baseUrl}/api/categories`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true,
          });
          setCategories(categoriesResponse.data.categories || []);
        }
      } catch (err) {
        console.error(`Fetch ${type} error:`, err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          try {
            await dispatch(fetchCurrentUser()).unwrap();
            const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
            const retryResponse = await axios.get(`${baseUrl}${config.endpoint}/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              withCredentials: true,
            });
            const data = retryResponse.data[type] || retryResponse.data[type.slice(0, -1)] || retryResponse.data;
            if (type === 'users') {
              setTargetUserRole(data.roles);
            }
            setFormData({
              ...data,
              images: type === 'products' ? (Array.isArray(data.images) ? data.images : [data.images].filter(Boolean)) : data.images || [],
              image: type === 'banners' ? (Array.isArray(data.image) ? data.image[0] : data.image) : data.image,
              permanentAddress: data.permanentAddress || { street: '', city: '', state: '', postalCode: '', country: '' },
              additionalAddresses: data.additionalAddresses || [],
            });
            setError('');
            if (type === 'products') {
              const categoriesResponse = await axios.get(`${baseUrl}/api/categories`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
              });
              setCategories(categoriesResponse.data.categories || []);
            }
          } catch (retryErr) {
            setError('Session expired. Please log in again.');
            toast.error('Session expired. Please log in again.');
            navigate('/login');
          }
        } else {
          setError(err.response?.data?.message || `Failed to fetch ${type}. Please try again.`);
          toast.error(err.response?.data?.message || `Failed to fetch ${type}. Please try again.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paramType, id, navigate, dispatch, userRole, config, type]);

  const handleChange = (e) => {
    const { name, value, type: inputType, files } = e.target;
    if (inputType === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'products' ? Array.from(files) : files[0],
      }));
    } else if (name.includes('permanentAddress.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...prev.permanentAddress, [field]: value },
      }));
    } else if (name.includes('additionalAddresses.')) {
      const [index, field] = name.split('.')[1].split('_');
      setFormData((prev) => ({
        ...prev,
        additionalAddresses: prev.additionalAddresses.map((addr, i) =>
          i === parseInt(index) ? { ...addr, [field]: value } : addr
        ),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
    setSuccess('');
  };

  const addAdditionalAddress = () => {
    setFormData((prev) => ({
      ...prev,
      additionalAddresses: [...(prev.additionalAddresses || []), { street: '', city: '', state: '', postalCode: '', country: '' }],
    }));
    toast.success('Additional address added');
  };

  const removeAdditionalAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalAddresses: prev.additionalAddresses.filter((_, i) => i !== index),
    }));
    toast.success('Address removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (type === 'users') {
      if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.username?.trim()) {
        setError('First name, last name, and username are required');
        toast.error('Please fill all required fields');
        return;
      }
      if (userRole === 'Admin') {
        if (!formData.email?.trim()) {
          setError('Email is required');
          toast.error('Email is required');
          return;
        }
        if (formData.permanentAddress && (
          !formData.permanentAddress.street?.trim() ||
          !formData.permanentAddress.city?.trim() ||
          !formData.permanentAddress.state?.trim() ||
          !formData.permanentAddress.postalCode?.trim() ||
          !formData.permanentAddress.country?.trim()
        )) {
          setError('All permanent address fields are required');
          toast.error('Please fill all permanent address fields');
          return;
        }
        for (let i = 0; i < (formData.additionalAddresses || []).length; i++) {
          const addr = formData.additionalAddresses[i];
          if (!addr.street?.trim() || !addr.city?.trim() || !addr.state?.trim() ||
              !addr.postalCode?.trim() || !addr.country?.trim()) {
            setError(`All fields in additional address ${i + 1} are required`);
            toast.error(`Please fill all fields in additional address ${i + 1}`);
            return;
          }
        }
      }
    } else if (type === 'categories') {
      if (!formData.name?.trim()) {
        setError('Category name is required');
        toast.error('Category name is required');
        return;
      }
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'images' && type === 'products') {
        formData.images.forEach((file, index) => {
          formDataToSend.append(`images[${index}]`, file);
        });
      } else if (key === 'image' && type === 'banners') {
        formDataToSend.append('image', formData.image);
      } else if (key === 'permanentAddress') {
        Object.keys(formData.permanentAddress).forEach((subKey) => {
          formDataToSend.append(`permanentAddress[${subKey}]`, formData.permanentAddress[subKey] || '');
        });
      } else if (key === 'additionalAddresses') {
        formData.additionalAddresses.forEach((addr, index) => {
          Object.keys(addr).forEach((subKey) => {
            formDataToSend.append(`additionalAddresses[${index}][${subKey}]`, addr[subKey] || '');
          });
        });
      } else {
        formDataToSend.append(key, formData[key] || '');
      }
    });

    try {
      const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
      const response = await axios.put(`${baseUrl}${config.endpoint}/${id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setSuccess(`${type.slice(0, -1)} updated successfully`);
      toast.success(`${type.slice(0, -1)} updated successfully`);
      setTimeout(() => navigate(config.editPath.split('/edit')[0]), 2000);
    } catch (err) {
      console.error(`Update ${type} error:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      if (err.response?.status === 401 || err.response?.status === 403) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
          const retryFormData = new FormData();
          Object.keys(formData).forEach((key) => {
            if (key === 'images' && type === 'products') {
              formData.images.forEach((file, index) => {
                retryFormData.append(`images[${index}]`, file);
              });
            } else if (key === 'image' && type === 'banners') {
              retryFormData.append('image', formData.image);
            } else if (key === 'permanentAddress') {
              Object.keys(formData.permanentAddress).forEach((subKey) => {
                retryFormData.append(`permanentAddress[${subKey}]`, formData.permanentAddress[subKey] || '');
              });
            } else if (key === 'additionalAddresses') {
              formData.additionalAddresses.forEach((addr, index) => {
                Object.keys(addr).forEach((subKey) => {
                  retryFormData.append(`additionalAddresses[${index}][${subKey}]`, addr[subKey] || '');
                });
              });
            } else {
              retryFormData.append(key, formData[key] || '');
            }
          });
          const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
          await axios.put(`${baseUrl}${config.endpoint}/${id}`, retryFormData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          });
          setSuccess(`${type.slice(0, -1)} updated successfully`);
          toast.success(`${type.slice(0, -1)} updated successfully`);
          setTimeout(() => navigate(config.editPath.split('/edit')[0]), 2000);
        } catch (retryErr) {
          setError('Session expired. Please log in again.');
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
      } else {
        const errorMessage = err.response?.data?.message || `Failed to update ${type}. Please try again later.`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  if (loading || authLoading) return <Loading />;

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#FFF0CE] p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded flex items-center"
        >
          <AlertCircle size={20} className="mr-2" />
          {error || 'Invalid type'}
        </motion.div>
      </div>
    );
  }

  if (userRole === 'Manager' && type === 'users' && ['Admin', 'Manager'].includes(targetUserRole)) {
    return (
      <div className="min-h-screen bg-[#FFF0CE] p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded flex items-center"
        >
          <AlertCircle size={20} className="mr-2" />
          Managers cannot edit Admin or Manager profiles
        </motion.div>
      </div>
    );
  }

  const renderInput = (key, label, type = 'text', options = null, required = false) => {
    if (type === 'textarea') {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <label className="block text-[#0C356A] font-medium mb-2 flex items-center">
            <User size={18} className="mr-2" /> {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            name={key}
            value={formData[key] || ''}
            onChange={handleChange}
            className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE] bg-white"
            disabled={userRole === 'Manager' && ['email', 'phoneNumber', 'points'].includes(key)}
            required={required}
          />
        </motion.div>
      );
    }

    if (type === 'select') {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <label className="block text-[#0C356A] font-medium mb-2 flex items-center">
            <User size={18} className="mr-2" /> {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            name={key}
            value={formData[key] || ''}
            onChange={handleChange}
            className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE] bg-white"
            disabled={userRole === 'Manager'}
            required={required}
          >
            <option value="">Select {label}</option>
            {options?.map((option) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </select>
        </motion.div>
      );
    }

    if (type === 'file' && key === 'images') {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <label className="block text-[#0C356A] font-medium mb-2 flex items-center">
            <Camera size={18} className="mr-2" /> {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="file"
            name={key}
            multiple
            accept="image/*"
            onChange={handleChange}
            className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE] bg-white"
          />
          {formData.images?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Product ${index}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      );
    }

    if (type === 'file') {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <label className="block text-[#0C356A] font-medium mb-2 flex items-center">
            <Camera size={18} className="mr-2" /> {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="file"
            name={key}
            accept="image/*"
            onChange={handleChange}
            className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE] bg-white"
          />
          {formData[key] && (
            <img
              src={typeof formData[key] === 'string' ? formData[key] : URL.createObjectURL(formData[key])}
              alt={label}
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <label className="block text-[#0C356A] font-medium mb-2 flex items-center">
          {key === 'email' && <Mail size={18} className="mr-2" />}
          {key === 'phoneNumber' && <Phone size={18} className="mr-2" />}
          {key === 'points' && <Award size={18} className="mr-2" />}
          {['firstName', 'lastName', 'username'].includes(key) && <User size={18} className="mr-2" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          name={key}
          value={formData[key] || ''}
          onChange={handleChange}
          className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE] bg-white"
          disabled={userRole === 'Manager' && ['email', 'phoneNumber', 'points'].includes(key)}
          required={required}
        />
      </motion.div>
    );
  };

  const renderAddressFields = (address, prefix, label, index = null) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + (index || 0) * 0.1 }}
      className="mb-4"
    >
      <div className="flex justify-between items-center mb-2">
        <label className="block text-[#0C356A] font-medium flex items-center">
          <MapPin size={18} className="mr-2" /> {label}
        </label>
        {index !== null && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => removeAdditionalAddress(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </motion.button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
          <div key={`${prefix}.${field}`} className="mb-2">
            <input
              type="text"
              name={`${prefix}.${field}`}
              value={address[field] || ''}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full p-3 border border-[#0174BE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0174BE] bg-white"
              disabled={userRole === 'Manager' && prefix === 'permanentAddress'}
              required
            />
          </div>
        ))}
      </div>
    </motion.div>
  );

  const fields = {
    users: [
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
      { key: 'username', label: 'Username', required: true },
      ...(userRole === 'Admin' ? [
        { key: 'email', label: 'Email', required: true },
        { key: 'phoneNumber', label: 'Phone Number' },
        { key: 'points', label: 'Points', type: 'number' },
        { key: 'roles', label: 'Role', type: 'select', options: [
          { _id: 'Admin', name: 'Admin' },
          { _id: 'Manager', name: 'Manager' },
          { _id: 'Seller', name: 'Seller' },
          { _id: 'User', name: 'User' },
        ]},
        { key: 'profilePicture', label: 'Profile Picture', type: 'file' },
      ] : []),
    ],
    categories: [
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    products: [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'productQuantity', label: 'Quantity', type: 'number', required: true },
      { key: 'category', label: 'Category', type: 'select', options: categories },
      { key: 'images', label: 'Images', type: 'file' },
    ],
    banners: [
      { key: 'image', label: 'Image', type: 'file', required: true },
      { key: 'link', label: 'Link' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FFF0CE] p-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0C356A', color: '#FFF0CE', border: '1px solid #0174BE' } }} />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white rounded-xl shadow-lg max-w-4xl mx-auto p-8"
      >
        <div className="absolute inset-0 border-4 border-transparent rounded-xl bg-gradient-to-r from-[#0174BE] to-[#0C356A] opacity-20 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-[#0C356A] mb-6 text-center">
          Edit {type.slice(0, -1)}
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded flex items-center"
            >
              <AlertCircle size={20} className="mr-2" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded flex items-center"
            >
              <CheckCircle size={20} className="mr-2" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields[type]?.map((field) => (
              <React.Fragment key={field.key}>
                {renderInput(field.key, field.label, field.type, field.options, field.required)}
              </React.Fragment>
            ))}
            {type === 'users' && userRole === 'Admin' && (
              <>
                {renderAddressFields(formData.permanentAddress || {}, 'permanentAddress', 'Permanent Address')}
                {formData.additionalAddresses?.map((addr, index) => (
                  <React.Fragment key={index}>
                    {renderAddressFields(addr, `additionalAddresses.${index}`, `Additional Address ${index + 1}`, index)}
                  </React.Fragment>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + formData.additionalAddresses.length * 0.1 }}
                  className="mb-4 col-span-1 sm:col-span-2"
                >
                  <motion.button
                    type="button"
                    onClick={addAdditionalAddress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center text-[#0174BE] hover:text-[#0C356A]"
                  >
                    <Plus size={18} className="mr-2" /> Add Another Address
                  </motion.button>
                </motion.div>
              </>
            )}
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <motion.button
              type="button"
              onClick={() => navigate(config.editPath.split('/edit')[0])}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#0174BE] text-[#FFF0CE] rounded-lg font-semibold hover:bg-[#0C356A] transition-colors"
              disabled={userRole === 'Manager' && type === 'users' && ['Admin', 'Manager'].includes(targetUserRole)}
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditForm;