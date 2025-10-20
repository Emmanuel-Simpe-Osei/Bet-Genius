"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  /* ✅ Detect screen size */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ✅ Auto close menu on route change */
  useEffect(() => setIsMobileMenuOpen(false), [pathname]);

  /* ✅ Close menu when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.querySelector(".sidebar-container");
      const button = document.querySelector(".mobile-menu-button");
      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(e.target) &&
        button &&
        !button.contains(e.target)
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

  /* ✅ Disable body scroll on mobile menu open */
  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen && isMobile ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isMobileMenuOpen, isMobile]);

  /* ✅ Protect admin dashboard route */
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log("🚫 No user session, redirecting to login...");
          router.push("/login");
          return;
        }

        // 🧠 Get role from localStorage or Supabase
        let cachedRole = localStorage.getItem("userRole");
        if (!cachedRole) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          cachedRole = profile?.role;
          if (cachedRole) localStorage.setItem("userRole", cachedRole);
        }

        console.log("🔍 Role check in DashboardLayout:", cachedRole);

        if (cachedRole !== "admin") {
          console.warn(
            "⚠️ Non-admin user tried to access /dashboard → redirecting..."
          );
          router.push("/user-dashboard");
        }
      } catch (err) {
        console.error("🔥 Error checking admin access:", err.message);
      }
    };

    checkAdminAccess();
  }, [router]);

  /* ✅ Sidebar navigation */
  /* ✅ Sidebar navigation */
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/games", label: "Games" },
    { href: "/dashboard/archived", label: "Archived" }, // 🆕 Added Archived page
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/settings", label: "Settings" },
    { href: "/", label: "Home" },
    { href: "/predictions", label: "Predictions" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#142B6F] text-white">
      {/* ====== MOBILE OVERLAY ====== */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ====== SIDEBAR ====== */}
      <motion.aside
        className="sidebar-container fixed lg:sticky top-0 flex flex-col bg-[#142B6F] text-white shadow-xl z-50 h-screen"
        animate={{
          width: isSidebarOpen ? 250 : isMobile ? 250 : 80,
          x: isMobileMenuOpen ? 0 : isMobile ? -280 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* --- HEADER --- */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD601] rounded-xl flex items-center justify-center text-[#142B6F] font-bold text-lg">
              R
            </div>
            {(isSidebarOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-xl font-semibold">Admin Panel</h1>
                <p className="text-xs text-gray-300">Welcome back</p>
              </motion.div>
            )}
          </div>

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              ✕
            </button>
          )}
        </div>

        {/* --- NAV LINKS --- */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[#FFD601] text-[#142B6F] font-semibold"
                      : "hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* --- FOOTER BUTTONS --- */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#FFD601] text-[#142B6F] rounded-xl font-semibold hover:opacity-90 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Logout</span>
          </motion.button>

          {!isMobile && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 text-sm transition-all"
            >
              {isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            </button>
          )}
        </div>
      </motion.aside>

      {/* ====== MAIN CONTENT ====== */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* --- TOP BAR --- */}
        <header className="bg-white/10 backdrop-blur-md sticky top-0 p-4 flex items-center justify-between border-b border-white/10">
          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-button lg:hidden p-2 rounded-lg bg-[#FFD601] text-[#142B6F]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>

          {/* Page Title */}
          <h1 className="text-lg lg:text-xl font-semibold text-[#FFD601]">
            {navItems.find((i) => i.href === pathname)?.label || "Dashboard"}
          </h1>

          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFD601] text-[#142B6F] rounded-full flex items-center justify-center font-semibold">
              A
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6 overflow-y-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
