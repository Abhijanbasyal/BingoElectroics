import React from 'react';
  import { useLocation } from 'react-router-dom';

  const Order = () => {
    const { state } = useLocation();
    const cartItems = state?.cartItems || [];

    return (
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Confirmation</h1>
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId._id.toString()} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1 ml-4">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">Total: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</h2>
                <p className="mt-4 text-gray-600">Please proceed with payment or contact support to complete your order.</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No items selected for order.</p>
          )}
        </div>
      </div>
    );
  };

  export default Order;