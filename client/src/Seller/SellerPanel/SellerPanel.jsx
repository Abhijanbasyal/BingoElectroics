import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X, Folder, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import {
  menuItemVariants,
  sidebarVariants,
  submenuVariants,
  submenuItemVariants,
} from "../../Vairants/export";

const SellerPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      name: "Products",
      icon: Folder,
      subItems: [
        { name: "Manage Products", path: "/seller/management/products" },
        { name: "Add Product", path: "/seller/Forms/AddProduct" },
      ],
    },
    { name: "LogOut", icon: LogOut, path: "/seller/logout" },
  ];

  const toggleSubMenu = (name) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="min-h-screen bg-primary flex">
      <AnimatePresence>
        {isSidebarOpen && !isLargeScreen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <motion.aside
          key="sidebar"
          initial="closed"
          animate={isLargeScreen ? "open" : isSidebarOpen ? "open" : "closed"}
          variants={sidebarVariants}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-fourth text-white lg:static lg:w-64 shadow-xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-tertiary/20">
            <motion.h1
              className="text-xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              CompanyName
            </motion.h1>
            {!isLargeScreen && (
              <motion.button
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={24} />
              </motion.button>
            )}
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
                <motion.li
                  key={`menu-${item.name}-${index}`}
                  variants={menuItemVariants}
                  custom={index}
                >
                  <div className="flex items-center">
                    <NavLink
                      to={item.path || "#"}
                      className={({ isActive }) =>
                        `flex items-center flex-1 p-3 rounded-lg transition-all duration-200 hover:bg-tertiary/50 ${
                          isActive && !item.subItems
                            ? "bg-tertiary/70 text-white"
                            : ""
                        }`
                      }
                      onClick={() => {
                        if (!item.subItems) setIsSidebarOpen(false);
                      }}
                    >
                      <item.icon size={20} className="mr-3" />
                      <span>{item.name}</span>
                    </NavLink>

                    {item.subItems && (
                      <motion.button
                        onClick={() => toggleSubMenu(item.name)}
                        className="p-2 rounded-full hover:bg-tertiary/30"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {openSubMenus[item.name] ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </motion.button>
                    )}
                  </div>

                  {item.subItems && (
                    <AnimatePresence>
                      {openSubMenus[item.name] && (
                        <motion.ul
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={submenuVariants}
                          className="ml-6 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.subItems.map((subItem, subIndex) => (
                            <motion.li
                              key={`submenu-${item.name}-${subItem.name}-${subIndex}`}
                              variants={submenuItemVariants}
                            >
                              <NavLink
                                to={subItem.path}
                                className={({ isActive }) =>
                                  `flex items-center p-2 pl-4 rounded-lg transition-all duration-200 hover:bg-tertiary/30 ${
                                    isActive ? "bg-tertiary/50 text-white" : ""
                                  }`
                                }
                                onClick={() => setIsSidebarOpen(false)}
                              >
                                <span>{subItem.name}</span>
                              </NavLink>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.aside>
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header
          className="bg-secondary p-4 flex justify-between items-center shadow-md"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="lg:hidden mr-4"
            onClick={() => setIsSidebarOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={24} className="text-fourth" />
          </motion.button>
        </motion.header>

        <motion.main
          className="flex-1 p-6 bg-primary overflow-y-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default SellerPanel;