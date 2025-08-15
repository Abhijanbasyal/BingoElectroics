import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart } from 'react-icons/fi';
import { Menu, X } from 'lucide-react';
import { logoutUser } from '../redux/authSlice';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false); // Original: hidden until scroll up
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(true); // Show navbar when scrolling down (original logic)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(false); // Hide when scrolling up (original logic)
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogoutUser = () => {
    dispatch(logoutUser());
    setIsMobileMenuOpen(false);
  };

  const hasRole = (role) => {
    if (!user?.roles) return false;
    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    return user.roles === role;
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
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
              BingoElectronics
            </NavLink>
          </div>
          <div className="hidden tablet:flex space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/aboutUs"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
              }
            >
              Contact
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
                }
              >
                Profile
              </NavLink>
            )}
            {isAuthenticated && hasRole('Admin') && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
                }
              >
                Admin
              </NavLink>
            )}
            {isAuthenticated && hasRole('Manager') && (
              <NavLink
                to="/manager"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
                }
              >
                Manager Panel
              </NavLink>
            )}
            {isAuthenticated && hasRole('Seller') && (
              <NavLink
                to="/seller"
                className={({ isActive }) =>
                  `hover:text-[#FFC436] transition-colors ${isActive ? 'text-[#FFC436]' : ''}`
                }
              >
                Seller Panel
              </NavLink>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <span className="text-lg hidden tablet:block">Welcome, {user.username}</span>
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
                  className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors hidden tablet:block"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors hidden tablet:block"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors hidden tablet:block"
                >
                  Signup
                </NavLink>
              </>
            )}
            <button
              className="tablet:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="tablet:hidden bg-[#0C356A] text-[#FFF0CE] px-4 py-2"
            >
              <div className="flex flex-col space-y-2">
                <NavLink
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/aboutUs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                  }
                >
                  Contact
                </NavLink>
                {isAuthenticated && (
                  <NavLink
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                    }
                  >
                    Profile
                  </NavLink>
                )}
                {isAuthenticated && hasRole('Admin') && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                    }
                  >
                    Admin
                  </NavLink>
                )}
                {isAuthenticated && hasRole('Manager') && (
                  <NavLink
                    to="/manager"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                    }
                  >
                    Manager Panel
                  </NavLink>
                )}
                {isAuthenticated && hasRole('Seller') && (
                  <NavLink
                    to="/seller"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `hover:text-[#FFC436] transition-colors py-2 ${isActive ? 'text-[#FFC436]' : ''}`
                    }
                  >
                    Seller Panel
                  </NavLink>
                )}
                {isAuthenticated && user && (
                  <span className="text-lg py-2">Welcome, {user.username}</span>
                )}
                {isAuthenticated ? (
                  <>
                    <NavLink
                      to="/cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="relative py-2"
                    >
                      <span className="flex items-center">
                        <FiShoppingCart size={24} className="hover:text-[#FFC436] mr-2" />
                        Cart
                        {cartCount > 0 && (
                          <span className="absolute left-16 top-2 bg-[#FFC436] text-[#0C356A] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                    <button
                      onClick={handleLogoutUser}
                      className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="bg-[#0174BE] text-[#FFF0CE] px-4 py-2 rounded-lg hover:bg-[#FFC436] transition-colors"
                    >
                      Signup
                    </NavLink>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;