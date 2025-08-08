import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../redux/cartSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ProductFilter from '../../components/ProductFilter';
import ProductCard from './ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await axios.get('/api/categories');
        const validCategories = categoriesRes.data.slice(0, 6);
        if (!validCategories.length) {
          toast.error('No categories found');
          return;
        }
        setCategories(validCategories);

        const featuredRes = await axios.get('/api/products/featured?limit=5');
        const featuredData = featuredRes.data || [];
        setFeaturedProducts(featuredData);

        const productsPromises = validCategories.map((cat) =>
          axios.get(`/api/products?categoryId=${cat._id}&limit=10`)
        );
        const productsResponses = await Promise.all(productsPromises);
        const allProducts = productsResponses.flatMap((res) => res.data || []);
        if (!allProducts.length) {
          toast.error('No products found');
          return;
        }
        setProducts(allProducts);

        console.log('Fetched categories:', validCategories);
        console.log('Fetched featured products:', featuredData);
        console.log('Fetched products:', allProducts);
      } catch (err) {
        toast.error(`Failed to load data: ${err.response?.data?.message || err.message}`);
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product) => {
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
    axios.put(`/api/products/${product._id}/bought`, {}, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    }).catch(err => console.error('Failed to update bought count:', err));

    toast.success(`${product.title} added to cart!`);
  };

  const handleViewProduct = (id) => {
    navigate(`/products/${id}`);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    applyFilters(value, selectedCategory);
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    applyFilters(searchTerm, categoryId);
  };

  const applyFilters = async (search, category) => {
    try {
      if (category) {
        const res = await axios.get(`/api/products?categoryId=${category}&limit=10`);
        let filteredProducts = res.data || [];
        if (search) {
          filteredProducts = filteredProducts.filter((product) =>
            product.title.toLowerCase().includes(search.toLowerCase())
          );
        }
        setProducts(filteredProducts);
      } else {
        const productsPromises = categories.map((cat) =>
          axios.get(`/api/products?categoryId=${cat._id}&limit=10`)
        );
        const productsResponses = await Promise.all(productsPromises);
        let allProducts = productsResponses.flatMap((res) => res.data || []);
        if (search) {
          allProducts = allProducts.filter((product) =>
            product.title.toLowerCase().includes(search.toLowerCase())
          );
        }
        setProducts(allProducts);
      }
    } catch (err) {
      toast.error(`Failed to apply filters: ${err.response?.data?.message || err.message}`);
      console.error('Filter error:', err);
    }
  };

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="min-h-screen bg-primary px-6 py-12">
      <h1 className="text-3xl font-bold text-fourth mb-8 text-center">Our Products</h1>

      <ProductFilter
        categories={categories}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {featuredProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-tertiary mb-4 text-center">Top Viewed Products</h2>
          <Slider {...bannerSettings}>
            {featuredProducts.map((product) => (
              <div key={product._id} className="p-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      )}

      <div className="space-y-12">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id}>
              <h2 className="text-2xl font-semibold text-tertiary mb-4">{category.title}</h2>
              <Slider {...settings}>
                {products
                  .filter((product) => product.category._id === category._id)
                  .map((product) => (
                    <div key={product._id} className="p-2">
                      <ProductCard product={product} />
                    </div>
                  ))}
              </Slider>
            </div>
          ))
        ) : (
          <div className="text-center text-fourth">Loading categories...</div>
        )}
      </div>
    </div>
  );
};

export default Products;