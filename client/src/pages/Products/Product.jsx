import React, { useEffect, useState } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { useDispatch, useSelector } from 'react-redux';
  import { addToCart } from '../../redux/cartSlice';
  import toast from 'react-hot-toast';
  import { motion } from 'framer-motion';
  import axios from 'axios';
  import APIEndPoints from '../../middleware/APIEndPoints';

  const Product = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(`${APIEndPoints.Get_products.url}/${id}`, {
            withCredentials: true,
          });
          const productData = res.data.product || res.data;
          setProduct(productData);
          console.log('Fetched product:', productData);
        } catch (err) {
          console.error('Fetch error:', err);
          setError(err.response?.data?.message || err.message);
          toast.error(`Failed to load product: ${err.response?.data?.message || err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
      if (!isAuthenticated) {
        toast.error('Please login to add items to cart');
        navigate('/login');
        return;
      }

      if (product) {
        try {
          console.log('User data:', user);
          console.log('Sending add to cart request at', new Date().toISOString(), ':', {
            userId: user._id,
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
          });
          await axios.post(APIEndPoints.Add_to_cart.url, {
            userId: user._id,
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
          }, { withCredentials: true });
          dispatch(addToCart({
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
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
      }
    };

    const handleNextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % (product.images?.length || 1));
    };

    const handlePrevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
    };

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-100 px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Loading...</h1>
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="min-h-screen bg-gray-100 px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-8">
            {error ? `Error: ${error}` : 'Product Not Found'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={product.images?.[currentImageIndex] || 'https://via.placeholder.com/500'}
                alt={product.title}
                className="w-full h-96 object-contain"
              />
              {product.images && product.images.length > 1 && (
                <div className="absolute top-1/2 left-4 right-4 flex justify-between transform -translate-y-1/2">
                  <button
                    onClick={handlePrevImage}
                    className="bg-white bg-opacity-75 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="bg-white bg-opacity-75 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} thumbnail ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded cursor-pointer ${currentImageIndex === index ? 'border-2 border-yellow-500' : 'border'}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              )) || <img src="https://via.placeholder.com/80" alt="Placeholder" className="w-20 h-20 object-cover rounded" />}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
            <p className="text-2xl text-yellow-600 font-semibold mb-4">${product.price?.toFixed(2)}</p>
            {product.loyaltyPoints > 0 && (
              <p className="text-sm text-gray-600 mb-2">Loyalty Points: {product.loyaltyPoints}</p>
            )}
            <p className="text-gray-600 mb-4">{product.description || 'No description available.'}</p>
            <p className="text-sm text-gray-600 mb-4">Category: {product.category?.title || 'Uncategorized'}</p>
            <div className="space-x-4 mb-4">
              <button
                onClick={handleAddToCart}
                className="bg-yellow-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Product Description */}
          <div className="lg:col-span-3 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product Description</h2>
            <p className="text-gray-600">{product.description || 'Detailed description not available.'}</p>
          </div>

          {/* Customer Reviews */}
          <div className="lg:col-span-3 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {product.comments?.length > 0 ? (
                product.comments.map((comment) => (
                  <div key={comment._id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600">{comment.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {comment.userId?.name || 'Anonymous'} -{' '}
                      {new Date(comment.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="lg:col-span-3 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Customers who bought this item also bought</h2>
            <p className="text-gray-600">
              Product recommendations will be provided by an AI recommendation system in a future update.
            </p>
          </div>
        </div>
      </div>
    );
  };

  export default Product;