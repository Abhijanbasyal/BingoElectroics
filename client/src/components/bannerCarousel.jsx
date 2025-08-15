import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import APIEndPoints from '../middleware/APIEndPoints';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const intervalRef = useRef(null); // Store interval ID for auto-rotation

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const response = await axios.get(APIEndPoints.Get_banners.url, {
          withCredentials: true,
        });
        setBanners(response.data.banners || []);
      } catch (err) {
        console.error('Fetch banners error:', err);
        toast.error('Failed to fetch banners');
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-rotation logic
  useEffect(() => {
    if (banners.length === 0) return;

    const startAutoRotation = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // 5-second interval
    };

    startAutoRotation();

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [banners]);

  const handleBannerClick = (link) => {
    if (link) {
      // Check if the link is an external URL
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        // Handle internal navigation
        navigate(link);
      }
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Pause on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Resume on mouse leave
  const handleMouseLeave = () => {
    if (banners.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
  };

  if (loading) {
    return <div className="text-center text-[#0C356A] py-10">Loading banners...</div>;
  }

  if (banners.length === 0) {
    return <div className="text-center text-[#0C356A] py-10">No banners available</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <div className="relative h-64 md:h-96">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentIndex}
            src={banners[currentIndex].image[0]}
            alt={`Banner ${currentIndex + 1}`}
            className={`w-full h-full object-cover ${banners[currentIndex].link ? 'cursor-pointer' : ''}`}
            onClick={() => handleBannerClick(banners[currentIndex].link)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
      </div>
      {banners.length > 1 && (
        <>
          <motion.button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ←
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            →
          </motion.button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-gray-400'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default BannerCarousel;