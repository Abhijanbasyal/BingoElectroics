import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addToCart } from '../../redux/cartSlice';
import toast from 'react-hot-toast';
import axios from 'axios';
import APIEndPoints from '../../middleware/APIEndPoints';

const ProductCard = ({ product }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            console.log('User data:', user);
            console.log('Sending add to cart request at', new Date().toISOString(), ':', {
                userId: user._id,
                productId: product._id,
                title: product.title,
                price: product.price,
                image: product.images[0] || 'https://via.placeholder.com/150',
            });
            const response = await axios.post(APIEndPoints.Add_to_cart.url, {
                userId: user._id,
                productId: product._id,
                title: product.title,
                price: product.price,
                image: product.images[0] || 'https://via.placeholder.com/150',
            }, { withCredentials: true });
            dispatch(addToCart({
                productId: product._id,
                title: product.title,
                price: product.price,
                image: product.images[0] || 'https://via.placeholder.com/150',
            }));
            toast.success(`${product.title} added to cart!`);
        } catch (err) {
            console.error('Add to cart failed at', new Date().toISOString(), ':', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
                stack: err.stack,
            });
            toast.error(`Failed to add item: ${err.response?.data?.message || err.message || 'Server error'}`);
        }
    };

    const handleViewProduct = () => {
        navigate(`/products/${product._id}`);
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
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleViewProduct}
                        className="flex-1 bg-[#FFC436] text-[#0C356A] py-2 rounded-lg font-semibold hover:bg-[#ffda74] transition-colors"
                    >
                        View Product
                    </button>
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-[#0174BE] text-[#FFF0CE] py-2 rounded-lg font-semibold hover:bg-[#045e9d] transition-colors"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;