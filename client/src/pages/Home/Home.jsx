import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductCard from '../Products/ProductCard';
import APIEndPoints from '../../middleware/APIEndPoints';
import { useSelector } from 'react-redux';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catResponse, prodResponse, bannerResponse] = await Promise.all([
          axios.get(APIEndPoints.Get_categories.url, { withCredentials: true }),
          axios.get(APIEndPoints.Get_products.url, { withCredentials: true }),
          axios.get(APIEndPoints.Get_banners.url, { withCredentials: true }),
        ]);

        setCategories(catResponse.data.categories || []);
        setProducts(prodResponse.data.products || []);
        setBanners(bannerResponse.data.banners || []);
        console.log('Fetched categories:', catResponse.data.categories);
        console.log('Fetched products:', prodResponse.data.products);
        console.log('Fetched banners:', bannerResponse.data.banners);
        console.log('Auth status:', isAuthenticated, 'User:', user, 'Role:', user?.role);
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
  }, []);

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
      {/* Banner Carousel */}
      <section className="mb-12">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 3000 }}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-[650px]"
        >
          {banners.length > 0 ? (
            banners.map((banner, index) => (
              <SwiperSlide key={index}>
                <img src={banner.image} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
              </SwiperSlide>
            ))
          ) : (
            <div className="text-center text-[#0C356A]">No banners available</div>
          )}
        </Swiper>
      </section>

      {/* Category Sections - Visible to everyone */}
      {categories.length > 0 ? (
        categories.slice(0, 6).map((category, index) => (
          <section key={category._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h2 className="text-2xl font-bold text-[#0C356A] mb-6">{category.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getProductsByCategory(category._id).length > 0 ? (
                getProductsByCategory(category._id).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="text-center text-[#0C356A]">No products available</div>
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