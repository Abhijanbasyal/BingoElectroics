import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart } from 'react-icons/fi';
import { logoutUser } from '../redux/authSlice';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const dispatch = useDispatch();

  const handleLogoutUser = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="top-0 left-0 w-full bg-[#0C356A] text-[#FFF0CE] shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-2xl font-bold">
              BingoElectronics
            </NavLink>
          </div>
          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? 'text-[#FFC436]' : ''
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/aboutUs"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? 'text-[#FFC436]' : ''
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? 'text-[#FFC436]' : ''
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${
                  isActive ? 'text-[#FFC436]' : ''
                }`
              }
            >
              Contact
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${
                    isActive ? 'text-[#FFC436]' : ''
                  }`
                }
              >
                Profile
              </NavLink>
            )}
            {isAuthenticated && user?.roles === 'Admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${
                    isActive ? 'text-[#FFC436]' : ''
                  }`
                }
              >
                Admin
              </NavLink>
            )}
            {isAuthenticated && user?.roles === 'Seller' && (
              <NavLink
                to="/seller"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${
                    isActive ? 'text-[#FFC436]' : ''
                  }`
                }
              >
                Seller Panel
              </NavLink>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <span className="text-lg">Welcome, {user.username}</span>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/cart" className="relative">
                  <FiShoppingCart size={24} className="hover:text-[#FFC436]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FFC436] text-[#0C356A] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
                <button
                  onClick={handleLogoutUser}
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
    </header>
  );
};

export default Header;