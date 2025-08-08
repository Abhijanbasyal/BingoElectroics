import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import APIEndPoints from '../../middleware/APIEndPoints';

const Cart = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState({});

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart();
    }
  }, [isAuthenticated, user?.id]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${APIEndPoints.Get_cart.url}/${user.id}`, { withCredentials: true });
      setCartItems(res.data.cart.products || []);
      const initialQuantities = (res.data.cart.products || []).reduce((acc, item) => ({ ...acc, [item.productId]: item.quantity }), {});
      setQuantity(initialQuantities);
    } catch (err) {
      toast.error(`Failed to load cart: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, title, price, image) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post(`${APIEndPoints.Add_to_cart.url}`, {
        userId: user.id,
        productId,
        title,
        price,
        image,
      }, { withCredentials: true });
      setCartItems(res.data.cart.products);
      toast.success(`${title} added to cart!`);
    } catch (err) {
      toast.error(`Failed to add item: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.delete(`${APIEndPoints.Remove_from_cart.url}/${user.id}/${productId}`, { withCredentials: true });
      setCartItems(cartItems.filter(item => item.productId !== productId));
      toast.success('Item removed from cart!');
    } catch (err) {
      toast.error(`Failed to remove item: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleQuantityChange = async (productId, value) => {
    const newQuantity = Math.max(1, value);
    try {
      await axios.put(`${APIEndPoints.Update_cart.url}/${user.id}/${productId}`, { quantity: newQuantity }, { withCredentials: true });
      setQuantity((prev) => ({ ...prev, [productId]: newQuantity }));
      setCartItems(cartItems.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
      toast.success('Quantity updated!');
    } catch (err) {
      toast.error(`Failed to update quantity: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate('/checkout', { state: { cartItems } });
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * (quantity[item.productId] || 1), 0);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1 ml-4">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={quantity[item.productId] || 1}
                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                    className="p-2 border rounded"
                  >
                    {[...Array(10).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}>{num + 1}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</h2>
              <button
                onClick={handleBuyNow}
                className="mt-4 bg-yellow-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Your cart is empty. Add some items to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Cart;