// import { NavLink } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logoutUser } from '../redux/authSlice';

// const Navbar = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();

//   const handleLogout = () => {
//     dispatch(logoutUser());
//   };

//   return (
//     <nav className="bg-secondary text-fourth p-4">
//       <div className="container mx-auto flex space-x-4">
//         <NavLink to="/" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Home</NavLink>
//         {isAuthenticated && user?.roles === 'Admin' && (
//           <NavLink to="/admin" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Admin Dashboard</NavLink>
//         )}
//         {isAuthenticated && (
//           <button onClick={handleLogout} className="hover:text-tertiary">Logout</button>
//         )}
//         {!isAuthenticated && (
//           <>
//             <NavLink to="/login" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Login</NavLink>
//             <NavLink to="/signup" className={({ isActive }) => isActive ? "text-tertiary font-bold" : "hover:text-tertiary"}>Signup</NavLink>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";
import { logoutUser } from "../redux/authSlice";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const dispatch = useDispatch();


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(true); // Show navbar when scrolling down
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(false); // Hide when scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handlelogoutUser = () => {
    dispatch(logoutUser());
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 w-full bg-[#0C356A] text-[#FFF0CE] shadow-lg z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold">
              ShopEasy
            </NavLink>
          </div>
          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? "text-[#FFC436]" : ""
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? "text-[#FFC436]" : ""
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? "text-[#FFC436]" : ""
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? "text-[#FFC436]" : ""
                }`
              }
            >
              Contact
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${
                    isActive ? "text-[#FFC436]" : ""
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </div>
          {isAuthenticated && user?.roles === "Admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "text-tertiary font-bold" : "hover:text-tertiary"
              }
            >
              Admin Dashboard
            </NavLink>
          )}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/cart/add" className="relative">
                  <FiShoppingCart size={24} className="hover:text-[#FFC436]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FFC436] text-[#0C356A] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
                <button
                  onClick={handlelogoutUser}
                  className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors"
                >
                  Signup
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
