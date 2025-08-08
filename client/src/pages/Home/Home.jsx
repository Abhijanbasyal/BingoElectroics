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
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catResponse, prodResponse, bannerResponse] = await Promise.all([
          axios.get(APIEndPoints.Get_categories.url, { withCredentials: true }),
          axios.get(APIEndPoints.Get_products.url, { withCredentials: true }),
          axios.get(APIEndPoints.Get_banners.url, { withCredentials: true }),
        ]);

        setCategories(catResponse.data.categories || []);
        setProducts(prodResponse.data.products || []);
        setBanners(bannerResponse.data || []);
      } catch (err) {
        toast.error('Failed to fetch data');
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
          className="w-full h-[400px]"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={index}>
              <img src={banner.image} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Category Sections - Only visible to admin */}
      {isAuthenticated && user?.roles.includes('admin') && (
        <>
          {categories.slice(0, 2).map((category, index) => (
            <section key={category._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <h2 className="text-2xl font-bold text-[#0C356A] mb-6">{category.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getProductsByCategory(category._id).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default Home;