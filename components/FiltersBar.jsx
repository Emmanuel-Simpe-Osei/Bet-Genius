"use client";
import { motion } from "framer-motion";

export default function FiltersBar({
  activeType,
  setActiveType,
  activeDay,
  setActiveDay,
  hideCustom = false, // 👈 optional prop (default false)
}) {
  // ✅ Tabs shown to the user (Custom tab hidden by default)
  const typeTabs = hideCustom
    ? ["Free", "VIP", "Correct Score"]
    : ["Free", "VIP", "Correct Score", "Custom"];

  const dayTabs = ["Yesterday", "Today", "Tomorrow"];

  // ✅ Handle clicks — ensures "Custom VIP" & "Custom Correct Score"
  // still appear under VIP and Correct Score filters
  const handleTypeSelect = (tab) => {
    // Internally normalize tab to handle grouping logic
    if (tab === "VIP") {
      // when user selects VIP → also show Custom VIP
      setActiveType("VIP");
    } else if (tab === "Correct Score") {
      // when user selects Correct Score → also show Custom Correct Score
      setActiveType("Correct Score");
    } else {
      setActiveType(tab);
    }
  };

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
            onClick={() => handleTypeSelect(tab)}
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
