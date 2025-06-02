import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addToCart } from '../../redux/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0] || 'https://via.placeholder.com/150',
      })
    );
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <img
        src={product.images[0] || 'https://via.placeholder.com/150'}
        alt={product.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#0C356A]">{product.title}</h3>
        <p className="text-[#0174BE] font-medium">${product.price.toFixed(2)}</p>
        <p className="text-sm text-[#0C356A]">Points: {product.points}</p>
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-[#0174BE] text-[#FFF0CE] py-2 rounded-lg hover:bg-[#FFC436] transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;