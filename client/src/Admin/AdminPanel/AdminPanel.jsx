
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Users,
  User,
  Folder,
  Trash,
  LogOut,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  dropdownItemVariants,
  menuItemVariants,
  dropdownVariants,
  sidebarVariants,
  submenuVariants,
  submenuItemVariants,
} from "../../Vairants/export";

const AdminPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/admin" },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
      subItems: [{ name: "Roles", path: "/admin/users/roles" }],
    },
    {
      name: "Form",
      icon: Folder,
      subItems: [
        { name: "Category", path: "/admin/form/category" },
        { name: "User", path: "/admin/form/user" },
      ],
    },
    { name: "RecycleBin", icon: Trash, path: "/admin/recycle-bin" },
    { name: "Profile", icon: User, path: "/admin/profile" },
    { name: "LogOut", icon: LogOut, path: "/admin/logout" },
  ];

  const toggleSubMenu = (name) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Sidebar Overlay for Mobile */}
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
          animate={isLargeScreen ? "open" : (isSidebarOpen ? "open" : "closed")}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          className="bg-secondary p-4 flex justify-between items-center shadow-md"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <motion.button
              className="lg:hidden mr-4"
              onClick={() => setIsSidebarOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} className="text-fourth" />
            </motion.button>

            <motion.div
              className="relative"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fourth/70"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-white text-fourth border border-tertiary/30 focus:outline-none focus:ring-2 focus:ring-tertiary/50 focus:border-transparent w-64"
              />
            </motion.div>
          </div>

          <div className="relative">
            <motion.button
              className="flex items-center space-x-2 text-fourth bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all duration-200"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Username</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-tertiary/20"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <motion.div variants={dropdownItemVariants}>
                    <NavLink
                      to="/admin/profile"
                      className="flex items-center px-4 py-2 text-fourth hover:bg-primary/50 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </NavLink>
                  </motion.div>
                  <motion.div variants={dropdownItemVariants}>
                    <NavLink
                      to="/admin/logout"
                      className="flex items-center px-4 py-2 text-fourth hover:bg-primary/50 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </NavLink>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Main Content Area */}
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

export default AdminPanel;