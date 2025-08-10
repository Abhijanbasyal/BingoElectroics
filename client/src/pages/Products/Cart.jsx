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
    const [selectedItems, setSelectedItems] = useState({});

    useEffect(() => {
      if (isAuthenticated && user?._id) {
        fetchCart();
      }
    }, [isAuthenticated, user?._id]);

    const fetchCart = async () => {
      setLoading(true);
      try {
        console.log('Fetching cart for user:', user);
        const res = await axios.get(`${APIEndPoints.Get_cart.url}/${user._id}`, { withCredentials: true });
        console.log('Cart response:', res.data);
        const cart = res.data.cart || { products: [] };
        setCartItems(cart.products || []);
        const initialQuantities = (cart.products || []).reduce((acc, item) => ({ ...acc, [item.productId._id]: item.quantity }), {});
        setQuantity(initialQuantities);
        // Initialize selected items based on existing cart items
        const initialSelected = (cart.products || []).reduce((acc, item) => ({ ...acc, [item.productId._id]: true }), {});
        setSelectedItems(initialSelected);
      } catch (err) {
        console.error('Fetch cart error at', new Date().toISOString(), ':', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          stack: err.stack,
        });
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
        console.log('Adding to cart:', { userId: user._id, productId, title, price, image });
        const res = await axios.post(`${APIEndPoints.Add_to_cart.url}`, {
          userId: user._id,
          productId,
          title,
          price,
          image,
        }, { withCredentials: true });
        const cart = res.data.cart || { products: [] };
        setCartItems(cart.products);
        toast.success(`${title} added to cart!`);
      } catch (err) {
        console.error('Add to cart error at', new Date().toISOString(), ':', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          stack: err.stack,
        });
        toast.error(`Failed to add item: ${err.response?.data?.message || err.message}`);
      }
    };

    const handleRemoveFromCart = async (productId) => {
      try {
        console.log('Removing from cart:', { userId: user._id, productId: productId._id });
        const res = await axios.delete(`${APIEndPoints.Remove_from_cart.url}/${user._id}/${productId._id}`, { withCredentials: true });
        console.log('Remove response:', res.data);
        await fetchCart(); // Refresh cart to sync with backend
        toast.success('Item removed from cart!');
      } catch (err) {
        console.error('Remove from cart error at', new Date().toISOString(), ':', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          stack: err.stack,
        });
        toast.error(`Failed to remove item: ${err.response?.data?.message || err.message}`);
      }
    };

    const handleQuantityChange = async (productId, value) => {
      const maxQuantity = productId.productQuantity || 0;
      const newQuantity = Math.max(1, Math.min(value, maxQuantity));
      if (newQuantity > maxQuantity) {
        toast.error(`Quantity cannot exceed available stock of ${maxQuantity || 'unknown'}`);
        return;
      }
      try {
        console.log('Updating quantity:', { userId: user._id, productId: productId._id, quantity: newQuantity, maxQuantity });
        await axios.put(`${APIEndPoints.Update_cart.url}/${user._id}/${productId._id}`, { quantity: newQuantity }, { withCredentials: true });
        setQuantity((prev) => ({ ...prev, [productId._id]: newQuantity }));
        setCartItems(cartItems.map(item => item.productId._id === productId._id ? { ...item, quantity: newQuantity } : item));
        toast.success('Quantity updated!');
      } catch (err) {
        console.error('Update quantity error at', new Date().toISOString(), ':', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          stack: err.stack,
        });
        toast.error(`Failed to update quantity: ${err.response?.data?.message || err.message}`);
      }
    };

    const handleBuyNow = () => {
      if (!isAuthenticated) {
        toast.error('Please login to proceed to checkout');
        navigate('/login');
        return;
      }
      const selectedCartItems = cartItems.filter(item => selectedItems[item.productId._id]);
      if (selectedCartItems.length === 0) {
        toast.error('Please select at least one item to proceed');
        return;
      }
      navigate('/order', { state: { cartItems: selectedCartItems } });
    };

    const handleSelectItem = (productId, checked) => {
      setSelectedItems(prev => ({ ...prev, [productId._id]: checked }));
    };

    const totalPrice = cartItems.reduce((sum, item) => selectedItems[item.productId._id] ? sum + item.price * (quantity[item.productId._id] || 1) : sum, 0);

    if (loading) {
      return <div className="min-h-screen bg-gray-100 px-4 py-8 text-center">Loading...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const maxQuantity = item.productId?.productQuantity || 0;
                return (
                  <div key={item.productId._id.toString()} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
                    <input
                      type="checkbox"
                      checked={selectedItems[item.productId._id] || false}
                      onChange={(e) => handleSelectItem(item.productId, e.target.checked)}
                      className="mr-4"
                    />
                    <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1 ml-4">
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Available: {maxQuantity > 0 ? maxQuantity : 'N/A'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={quantity[item.productId._id] || 1}
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                        className="p-2 border rounded"
                      >
                        {[...Array(Math.min(maxQuantity || 10, 10)).keys()].map((num) => (
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
                );
              })}
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