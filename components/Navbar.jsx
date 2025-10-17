"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);

  // 🧭 Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟡 Navbar Links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/predictions", label: "Predictions" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/login", label: "Login", special: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#142B6F]/90 backdrop-blur-md border-b border-[#FFD601]/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-[#FFD601] flex items-center gap-2"
        >
          ⚽ <span className="tracking-wide">BetGenius</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-sm font-medium text-white">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.span
                className={`relative cursor-pointer ${
                  pathname === link.href
                    ? "text-[#FFD601]"
                    : "hover:text-[#FFD601]"
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#FFD601]"
                  />
                )}
              </motion.span>
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-2xl focus:outline-none"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu (Animated) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-[#1B308D] border-t border-[#FFD601]/30 shadow-xl md:hidden"
          >
            <ul className="flex flex-col py-4 text-center text-white font-medium space-y-2">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)} // Close on click
                    className={`block py-2 rounded-md ${
                      pathname === link.href
                        ? "text-[#FFD601] font-semibold"
                        : "hover:bg-[#142B6F] transition"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
