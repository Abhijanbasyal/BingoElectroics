
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiRotateCcw } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import tableConfig from '../utils/manageTable';

const DataTable = ({ type, deleted = false }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { endpoint, deletedEndpoint, restoreEndpoint, permanentDeleteEndpoint, columns, editPath, viewPath } = tableConfig[type] || {};

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${deleted ? deletedEndpoint : endpoint}?page=${page}`,
          { withCredentials: true }
        );
        setData(response.data[`${type}`]);
        setTotalPages(response.data[`total${type.charAt(0).toUpperCase() + type.slice(1)}`]);
      } catch (err) {
        toast.error(`Failed to fetch ${deleted ? 'deleted ' : ''}${type}`);
      } finally {
        setLoading(false);
      }
    };
    if (endpoint || deletedEndpoint) fetchData();
  }, [endpoint, deletedEndpoint, page, type, deleted]);

  // Handle delete (soft delete for non-deleted, permanent delete for deleted)
  const handleDelete = async (id) => {
    try {
      const url = deleted
        ? `${permanentDeleteEndpoint}/${id}/permanent`
        : `${endpoint}/${id}`;
      await axios.delete(url, { withCredentials: true });
      setData(data.filter((item) => item._id !== id));
      toast.success(`${type.slice(0, -1)} ${deleted ? 'permanently' : ''} deleted successfully`);
    } catch (err) {
      toast.error(`Failed to ${deleted ? 'permanently ' : ''}delete ${type.slice(0, -1)}`);
    }
  };

  // Handle restore
  const handleRestore = async (id) => {
    try {
      await axios.put(
        `${restoreEndpoint}/${id}/restore`,
        {},
        { withCredentials: true }
      );
      setData(data.filter((item) => item._id !== id));
      toast.success(`${type.slice(0, -1)} restored successfully`);
    } catch (err) {
      toast.error(`Failed to restore ${type.slice(0, -1)}`);
    }
  };

  // Format cell data
  const formatCell = (value, format) => {
    if (format === 'date') {
      return new Date(value).toLocaleDateString();
    } else if (format === 'currency') {
      return `$${parseFloat(value).toFixed(2)}`;
    } else if (typeof value === 'object' && value) {
      return value.username || value.title || '-';
    }
    return value || '-';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-primary p-6 rounded-lg shadow-lg"
    >
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-6 text-fourth capitalize">
        {deleted ? `Deleted ${type}` : type}
      </h2>

      {loading ? (
        <div className="text-center text-fourth">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-fourth">No {deleted ? 'deleted ' : ''}{type} found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary text-fourth">
                  <th className="p-3 text-left">S.N</th>
                  {columns.map((col, index) => (
                    <th key={index} className="p-3 text-left">
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {data.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-tertiary/20 hover:bg-tertiary/10"
                    >
                      <td className="p-3 text-fourth">{(page - 1) * 10 + index + 1}</td>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="p-3 text-fourth">
                          {formatCell(
                            col.key.includes('.')
                              ? col.key.split('.').reduce((obj, key) => obj?.[key], item)
                              : item[col.key],
                            col.format
                          )}
                        </td>
                      ))}
                      <td className="p-3 flex space-x-2">
                        {deleted ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRestore(item._id)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              title="Restore"
                            >
                              <FiRotateCcw size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(item._id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              title="Permanently Delete"
                            >
                              <FiTrash2 size={16} />
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`${viewPath}/${item._id}`)}
                              className="p-2 bg-tertiary text-white rounded-lg hover:bg-tertiary/80"
                              title="View"
                            >
                              <FiEye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`${editPath}/${item._id}`)}
                              className="p-2 bg-secondary text-fourth rounded-lg hover:bg-secondary/80"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(item._id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
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

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-fourth">
              Page {page} of {totalPages}
            </div>
            <div className="space-x-2">
              <motion.button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  page === 1
                    ? 'bg-tertiary/50 cursor-not-allowed'
                    : 'bg-tertiary hover:bg-tertiary/80'
                }`}
                whileHover={{ scale: page === 1 ? 1 : 1.05 }}
                whileTap={{ scale: page === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>
              <motion.button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  page === totalPages
                    ? 'bg-tertiary/50 cursor-not-allowed'
                    : 'bg-tertiary hover:bg-tertiary/80'
                }`}
                whileHover={{ scale: page === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: page === totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DataTable;