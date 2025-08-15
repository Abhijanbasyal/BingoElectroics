import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import ProductCard from '../Products/ProductCard';
import APIEndPoints from '../../middleware/APIEndPoints';
import { useSelector } from 'react-redux';
import BannerCarousel from '../../components/bannerCarousel';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Prepare headers for authenticated users
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Add createdBy filter for Sellers
        const productQuery = isAuthenticated && user?.roles === 'Seller'
          ? `${APIEndPoints.Get_products.url}?page=1&createdBy=${user.id}`
          : `${APIEndPoints.Get_products.url}?page=1`;

        const [catResponse, prodResponse] = await Promise.all([
          axios.get(`${APIEndPoints.Get_categories.url}?page=1`, { headers }), // Public access
          axios.get(productQuery, { headers }), // Public or filtered for Sellers
        ]);

        setCategories(catResponse.data.categories || []);
        setProducts(prodResponse.data.products || []);
        console.log('APIEndPoints:', APIEndPoints);
        console.log('Auth status:', isAuthenticated, 'User:', user, 'Role:', user?.roles);
      } catch (err) {
        const errorMsg = err.response
          ? `API Error: ${err.response.status} - ${err.response.data?.message || 'Forbidden'}`
          : `Network Error: ${err.message}`;
        setError(errorMsg);
        toast.error(`Failed to fetch data: ${errorMsg}`);
        console.error('Fetch error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user]);

  const getProductsByCategory = (categoryId) => {
    return products.filter((product) => product.category?._id === categoryId).slice(0, 4);
  };

  if (loading) {
    return <div className="text-center text-[#0C356A] py-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-[#0C356A] py-10">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#0174BE] text-[#FFF0CE] py-2 px-4 rounded-lg font-semibold hover:bg-[#045e9d] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF0CE] min-h-screen">
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
      {/* Banner Carousel */}
      <section className="mb-12">
        <BannerCarousel />
      </section>

      {/* Category Sections - Visible to everyone */}
      {categories.length > 0 ? (
        categories.slice(0, 6).map((category) => (
          <section key={category._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h2 className="text-2xl font-bold text-[#0C356A] mb-6">{category.name || category.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getProductsByCategory(category._id).length > 0 ? (
                getProductsByCategory(category._id).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="text-center text-[#0C356A] col-span-full">No products available</div>
              )}
            </div>
          </section>
        ))
      ) : (
        <div className="text-center text-[#0C356A] py-10">No categories available</div>
      )}
    </div>
  );
};

export default Home;