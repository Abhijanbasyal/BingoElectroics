import React from 'react';
import { motion } from 'framer-motion';

const ProductFilter = ({ categories, searchTerm, selectedCategory, onSearchChange, onCategoryChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-primary p-6 rounded-xl shadow-lg max-w-4xl mx-auto mb-6"
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <motion.div
          className="w-full sm:w-2/3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full p-3 rounded-lg border border-tertiary/30 bg-white text-fourth focus:outline-none focus:ring-2 focus:ring-tertiary/50 transition-all duration-200"
          />
        </motion.div>

        {/* Category Dropdown */}
        <motion.div
          className="w-full sm:w-1/3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full p-3 rounded-lg border border-tertiary/30 bg-white text-fourth focus:outline-none focus:ring-2 focus:ring-tertiary/50 transition-all duration-200 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductFilter;