

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { getFormConfig } from "../utils/manageForm";
import Loading from "../../components/LoadingComponent";
import APIEndPoints from "../../middleware/APIEndPoints";

const EditForm = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(getFormConfig(type, id));

  // Fetch data and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch item data
        const response = await axios.get(config.endpoint, { withCredentials: true });
        const dataKey = type === "user" ? "user" : type.slice(0, -1);
        setFormData(response.data[dataKey] || response.data);

        // Set image previews for products
        if (type === "product" && response.data.product?.images) {
          setImagePreviews(response.data.product.images);
        }

        // Fetch categories for product form
        if (type === "product") {
          const catResponse = await axios.get(APIEndPoints.Get_categories.url, {
            withCredentials: true,
          });
          setCategories(catResponse.data.categories || []);

          // Update config with category options
          setConfig({
            ...config,
            fields: config.fields.map((field) =>
              field.name === "category"
                ? {
                    ...field,
                    options: catResponse.data.categories.map((cat) => ({
                      value: cat._id,
                      label: cat.title,
                    })),
                  }
                : field
            ),
          });
        }
      } catch (err) {
        setError("Failed to fetch data");
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (config.endpoint) fetchData();
  }, [config.endpoint, type, id]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const newFiles = Array.from(files);
      setNewImages(newFiles);
      const previews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError("");
  };

  // Remove image
  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setNewImages(
      newImages.filter(
        (_, i) => i >= imagePreviews.length - newImages.length && i !== index
      )
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    for (const field of config.fields) {
      if (
        field.required &&
        !formData[field.name] &&
        field.type !== "file" &&
        !(field.name === "password" && !formData[field.name])
      ) {
        setError(`${field.label} is required`);
        toast.error(`${field.label} is required`);
        return;
      }
    }

    try {
      const submitData = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "images" && formData[key] !== undefined && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      // Add new images for products
      if (type === "product") {
        newImages.forEach((image) => {
          submitData.append("images", image);
        });
      }

      await axios.put(config.updateEndpoint, submitData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(`${type.slice(0, -1)} updated successfully!`);
      toast.success(`${type.slice(0, -1)} updated successfully!`);
      setTimeout(() => navigate(`/admin/management/${type}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update ${type.slice(0, -1)}`);
      toast.error(err.response?.data?.message || `Failed to update ${type.slice(0, -1)}`);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#FFF0CE] p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0C356A',
            color: '#FFF0CE',
            border: '1px solid #0174BE',
          },
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0C356A] p-6">
          <h2 className="text-2xl font-bold text-[#FFF0CE]">{config.title}</h2>
          <p className="text-[#FFC436]">Edit the details below</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded"
            >
              <div className="flex items-center">
                <CheckCircle className="mr-2" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.fields?.map((field) => (
                <div
                  key={field.name}
                  className={field.type === "textarea" || field.type === "file" ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-[#0C356A] mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0174BE] focus:border-transparent"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      disabled={loading}
                      required={field.required}
                      rows={4}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0174BE] focus:border-transparent"
                      disabled={loading || (field.name === "category" && !categories.length)}
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {(field.options || []).map((option) => (
                        <option key={option.value || option} value={option.value || option}>
                          {option.label || option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "file" ? (
                    <div>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                          </div>
                          <input
                            id={field.name}
                            name={field.name}
                            type="file"
                            onChange={handleChange}
                            className="hidden"
                            disabled={loading}
                            multiple={field.multiple}
                            accept={field.accept}
                          />
                        </label>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-[#0C356A] mb-2">Image Previews</h4>
                          <div className="flex flex-wrap gap-3">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index}`}
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0174BE] focus:border-transparent"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      disabled={loading}
                      required={field.required}
                      step={field.step}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-[#0C356A] rounded-lg text-[#0C356A] font-medium hover:bg-[#0C356A] hover:text-[#FFF0CE] transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#0C356A] text-[#FFF0CE] font-medium rounded-lg hover:bg-[#0174BE] transition-colors"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? "Updating..." : "Update"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditForm;