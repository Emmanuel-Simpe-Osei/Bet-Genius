"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const heroImages = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"];
  const [current, setCurrent] = useState(0);

  // ⏱ Automatically switch slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5s per image
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-[#142B6F] text-white overflow-hidden">
      <Navbar />

      {/* 🎡 Hero Section */}
      <section
        id="home"
        className="relative h-screen w-full flex items-center justify-center"
      >
        <AnimatePresence>
          {heroImages.map(
            (src, i) =>
              i === current && (
                <motion.img
                  key={src}
                  src={src}
                  alt={`Hero ${i}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )
          )}
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#142B6F]/70"></div>

        {/* Text content */}
        <div className="relative z-10 text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
          >
            Win Smarter, Bet Smarter ⚡
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white mt-4 max-w-2xl mx-auto text-lg"
          >
            Stay ahead with live football insights, expert predictions, and
            daily odds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 mt-8 flex-wrap justify-center"
          >
            <a
              href="https://t.me/YourChannelHere"
              target="_blank"
              className="bg-[#FFD601] text-[#142B6F] px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition"
            >
              Join Channel
            </a>
            <Link
              href="/predictions"
              className="border border-[#FFD601] text-[#FFD601] px-6 py-3 rounded-xl font-semibold hover:bg-[#FFD601] hover:text-[#142B6F] transition"
            >
              Get Odds
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ⚽ Leagues Section */}
      <section id="leagues" className="py-16 px-6 bg-[#142B6F] text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#FFD601] mb-10"
        >
          ⚽ We Cover Top Leagues
        </motion.h3>

        <div className="flex flex-wrap justify-center gap-6 text-lg text-white">
          {[
            "Premier League",
            "La Liga",
            "Serie A",
            "Bundesliga",
            "Ligue 1",
            "UCL",
          ].map((league) => (
            <motion.div
              key={league}
              whileHover={{ scale: 1.05 }}
              className="bg-[#1B308D] px-6 py-3 rounded-xl border border-[#FFD601]/30"
            >
              {league}
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📞 Contact Section */}
      <section id="contact" className="py-16 px-6 bg-[#1B308D] text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#FFD601] mb-6"
        >
          📞 Contact Us
        </motion.h3>
        <p className="text-white mb-6 max-w-2xl mx-auto">
          Have questions or want to partner with us? Reach us via:
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 text-white/90">
          <a
            href="mailto:support@betgenius.com"
            className="hover:text-[#FFD601] transition"
          >
            📧 support@betgenius.com
          </a>
          <a
            href="https://t.me/YourChannelHere"
            target="_blank"
            className="hover:text-[#FFD601] transition"
          >
            💬 Telegram Channel
          </a>
        </div>
      </section>

      <footer className="py-6 border-t border-[#FFD601]/20 text-center text-white/70 text-sm">
        © {new Date().getFullYear()} BetGenius. All rights reserved.
      </footer>
    </div>
  );
}
