"use client";
import { motion } from "framer-motion";

export default function FiltersBar({
  activeType,
  setActiveType,
  activeDay,
  setActiveDay,
  hideCustom = false, // 👈 optional prop (default false)
}) {
  // ✅ Removed "All" from both filters
  const typeTabs = hideCustom
    ? ["Free", "VIP", "Correct Score"]
    : ["Free", "VIP", "Correct Score", "Custom"];

  const dayTabs = ["Yesterday", "Today", "Tomorrow"];

  return (
    <div className="space-y-4">
      {/* 🗓 Day Filter */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {dayTabs.map((tab) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={tab}
            onClick={() => setActiveDay(tab)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
              activeDay === tab
                ? "bg-[#FFD601] text-[#142B6F] border-[#FFD601] shadow-lg"
                : "bg-white/5 text-white/90 border-white/10 hover:bg-white/10"
            }`}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      {/* 🎮 Type Filter */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {typeTabs.map((tab) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={tab}
            onClick={() => setActiveType(tab)}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
              activeType === tab
                ? "bg-[#FFD601] text-[#142B6F] border-[#FFD601] shadow-lg"
                : "bg-white/5 text-white/90 border-white/10 hover:bg-white/10"
            }`}
          >
            {tab}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
