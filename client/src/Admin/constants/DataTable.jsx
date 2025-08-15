import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { fetchCurrentUser } from '../../redux/authSlice';
import { Trash2, Edit, Eye, RefreshCw, XCircle } from 'lucide-react';
import Loading from '../../components/LoadingComponent';
import getTableConfig from '../utils/tableConfig';
import APIEndPoints from '../../middleware/APIEndPoints';

const DataTable = ({ type, deleted = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isAdmin = user?.roles === 'Admin';
  const isManager = user?.roles === 'Manager';
  const userRole = user?.roles || 'Admin';

  const tableConfig = getTableConfig(userRole);
  const validTypes = Object.keys(tableConfig);
  const config = tableConfig[type];

  const getEndpoint = () => {
    if (!validTypes.includes(type)) {
      return '';
    }
    const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
    return deleted
      ? `${baseUrl}${config.deletedEndpoint}?page=${page}`
      : `${baseUrl}${config.endpoint}?page=${page}`;
  };

  const fetchData = async () => {
    if (!validTypes.includes(type)) {
      setError(`Invalid type: ${type}`);
      toast.error(`Invalid type: ${type}`);
      navigate(userRole === 'Manager' ? '/manager' : '/admin');
      setLoading(false);
      return;
    }

    const endpoint = getEndpoint();
    if (!endpoint || !user) {
      setError('Invalid type or user not authenticated');
      toast.error('Invalid type or user not authenticated');
      navigate('/login');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log(`Fetching ${type} from: ${endpoint}`);
    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      const key = deleted ? type : type.slice(0, -1) + 's';
      setData(response.data[key] || []);
      setTotalPages(response.data.totalPages || 1);
      setError('');
    } catch (err) {
      console.error(`Fetch ${type} error:`, err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
          const retryResponse = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true,
          });
          const key = deleted ? type : type.slice(0, -1) + 's';
          setData(retryResponse.data[key] || []);
          setTotalPages(retryResponse.data.totalPages || 1);
          setError('');
        } catch (retryErr) {
          setError('Session expired. Please log in again.');
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
      } else {
        setError(err.response?.data?.message || `Failed to fetch ${type}`);
        toast.error(err.response?.data?.message || `Failed to fetch ${type}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`Current type: ${type}, deleted: ${deleted}`);
    fetchData();
  }, [type, page, deleted, user, dispatch, navigate]);

  const handleDelete = async (id) => {
    if (!isAdmin && !isManager) {
      toast.error('Unauthorized action');
      return;
    }

    const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
    const endpoint = `${baseUrl}${config.permanentDeleteEndpoint}/${id}`;
    if (!endpoint) {
      toast.error('Invalid type for deletion');
      return;
    }

    try {
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      toast.success(`${type.slice(0, -1)} permanently deleted`);
      fetchData();
    } catch (err) {
      console.error(`Delete ${type} error:`, err.response?.data || err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
          await axios.delete(endpoint, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true,
          });
          toast.success(`${type.slice(0, -1)} permanently deleted`);
          fetchData();
        } catch (retryErr) {
          setError('Session expired. Please log in again.');
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
      } else {
        setError(err.response?.data?.message || `Failed to delete ${type.slice(0, -1)}`);
        toast.error(err.response?.data?.message || `Failed to delete ${type.slice(0, -1)}`);
      }
    }
  };

  const handleRestore = async (id) => {
    if (!isAdmin && !isManager) {
      toast.error('Unauthorized action');
      return;
    }

    const baseUrl = APIEndPoints.baseUrl || 'http://localhost:8000';
    const endpoint = `${baseUrl}${config.restoreEndpoint}/${id}`;
    if (!endpoint) {
      toast.error('Invalid type for restoration');
      return;
    }

    try {
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
      });
      toast.success(`${type.slice(0, -1)} restored successfully`);
      fetchData();
    } catch (err) {
      console.error(`Restore ${type} error:`, err.response?.data || err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
          await axios.put(endpoint, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            withCredentials: true,
          });
          toast.success(`${type.slice(0, -1)} restored successfully`);
          fetchData();
        } catch (retryErr) {
          setError('Session expired. Please log in again.');
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
      } else {
        setError(err.response?.data?.message || `Failed to restore ${type.slice(0, -1)}`);
        toast.error(err.response?.data?.message || `Failed to restore ${type.slice(0, -1)}`);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderCell = (item, column) => {
    if (column.format === 'image') {
      return item[column.key]?.length > 0 ? (
        <img
          src={Array.isArray(item[column.key]) ? item[column.key][0] : item[column.key]}
          alt="Item"
          className="w-16 h-16 object-cover rounded"
        />
      ) : 'No Image';
    }
    if (column.format === 'currency') {
      return `$${parseFloat(item[column.key] || 0).toFixed(2)}`;
    }
    if (column.format === 'date') {
      return new Date(item[column.key]).toLocaleDateString();
    }
    if (column.key.includes('.')) {
      const keys = column.key.split('.');
      return keys.reduce((obj, key) => (obj ? obj[key] : 'N/A'), item);
    }
    return item[column.key] || 'N/A';
  };

  if (loading || authLoading) return <Loading />;

  if (!validTypes.includes(type)) {
    return (
      <div className="min-h-screen bg-primary p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded flex items-center"
        >
          <XCircle size={20} className="mr-2" />
          Invalid type: {type}. Please select a valid management option.
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-fourth">{deleted ? `${type} Recycle Bin` : `Manage ${type}`}</h2>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded flex items-center"
        >
          <XCircle size={20} className="mr-2" />
          {error}
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary text-white">
              <tr>
                {config?.columns.map((col) => (
                  <th key={col.key} className="px-6 py-3 text-left">{col.label}</th>
                ))}
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {config?.columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        {renderCell(item, col)}
                      </td>
                    ))}
                    <td className="px-6 py-4 flex space-x-2">
                      {!deleted ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              console.log(`Navigating to: ${config.editPath}/${item._id}`);
                              navigate(`${config.editPath}/${item._id}`);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`${config.viewPath}/${item._id}`)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Eye size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRestore(item._id)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <RefreshCw size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle size={18} />
                          </motion.button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-4">
          <motion.button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            whileHover={{ scale: page === 1 ? 1 : 1.05 }}
            whileTap={{ scale: page === 1 ? 1 : 0.95 }}
            className="px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </motion.button>
          <span className="text-fourth">Page {page} of {totalPages}</span>
          <motion.button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            whileHover={{ scale: page === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: page === totalPages ? 1 : 0.95 }}
            className="px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50"
          >
            Next
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;