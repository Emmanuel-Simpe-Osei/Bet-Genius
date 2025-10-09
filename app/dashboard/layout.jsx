"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Mobile detection - runs only on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(".sidebar-container");
      const mobileMenuButton = document.querySelector(".mobile-menu-button");

      // If click is outside sidebar AND not on mobile menu button, close mobile menu
      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        mobileMenuButton &&
        !mobileMenuButton.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isMobile]);

  // Navigation items with icons
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/games", label: "Games", icon: "🎮" },
    { href: "/dashboard/users", label: "Users", icon: "👥" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  // Handle Go To Homepage
  const handleGoToHomepage = () => {
    router.push("/");
  };

  // Toggle sidebar on collapsed mode click (desktop)
  const handleSidebarClick = () => {
    if (!isSidebarOpen && !isMobile) {
      setIsSidebarOpen(true);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Overlay - Now properly blocks interactions */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={closeMobileMenu}
            style={{ touchAction: "none" }} // ✅ Prevents any touch interactions
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="sidebar-container fixed lg:sticky top-0 bg-gradient-to-b from-[#002583] to-[#1a3a9c] text-white flex flex-col z-50 shadow-2xl h-screen"
        initial={false}
        animate={{
          width: isSidebarOpen ? 256 : isMobile ? 256 : 80, // ✅ Full width on mobile when open
          x: isMobileMenuOpen ? 0 : isMobile ? -320 : 0, // ✅ Proper mobile positioning
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
        }}
        onClick={handleSidebarClick}
      >
        {/* Header Section */}
        <motion.div
          className="p-6 border-b border-blue-600/30 flex-shrink-0"
          layout
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-[#FFB800] to-yellow-400 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">⚡</span>
              </motion.div>
              <AnimatePresence>
                {(isSidebarOpen || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1"
                  >
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      Admin Panel
                    </h1>
                    <p className="text-blue-200 text-xs mt-1">Welcome back!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Close button for mobile */}
            {isMobile && (
              <motion.button
                onClick={closeMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-600/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? "bg-[#FFB800] text-[#002583] shadow-lg shadow-yellow-500/25"
                      : "hover:bg-blue-600/50 hover:shadow-lg"
                  }`}
                  onClick={closeMobileMenu} // ✅ Close menu on navigation
                >
                  <motion.span
                    className="text-xl"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.icon}
                  </motion.span>
                  <AnimatePresence>
                    {(isSidebarOpen || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Action Buttons Section */}
        <div className="p-4 space-y-3 border-t border-blue-600/30 flex-shrink-0">
          {/* Go To Homepage Button */}
          <motion.button
            onClick={() => {
              handleGoToHomepage();
              closeMobileMenu();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-[#FFB800] to-yellow-400 text-[#002583] rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              className="text-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              🏠
            </motion.span>
            <AnimatePresence>
              {(isSidebarOpen || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Go To Homepage
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Toggle Sidebar Button - Hidden on mobile */}
          {!isMobile && (
            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600/50 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </motion.svg>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Collapse
                </motion.span>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm flex-shrink-0 fixed top-0 left-0 right-0 z-40 lg:relative lg:top-auto lg:left-auto lg:right-auto"
        >
          <div className="flex items-center justify-between p-4 lg:p-6">
            {/* Mobile Menu Button */}
            <motion.button
              onClick={toggleMobileMenu}
              className="mobile-menu-button lg:hidden p-2 rounded-xl bg-gradient-to-r from-[#002583] to-[#1a3a9c] text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={isMobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </motion.svg>
            </motion.button>

            {/* Page Title */}
            <motion.h1
              className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#002583] to-[#FFB800] bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {navItems.find((item) => item.href === pathname)?.label ||
                "Dashboard"}
            </motion.h1>

            {/* User Profile/Notifications */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Notification Bell */}
              <motion.button
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2.47 2.47a.75.75 0 0 0 .53 1.28h15.88a.75.75 0 0 0 .53-1.28L16.5 12V9.75a6 6 0 0 0-6-6z"
                  />
                </svg>
                <motion.span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              {/* User Avatar */}
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-[#002583] to-[#FFB800] rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                A
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 overflow-y-auto pt-16 lg:pt-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
