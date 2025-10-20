"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FiltersBar({
  activeType,
  setActiveType,
  activeDay,
  setActiveDay,
  hideCustom = false,
  selectedDate,
  setSelectedDate, // 👈 new prop for date picker
}) {
  // ✅ Tabs shown to the user
  const typeTabs = hideCustom
    ? ["Free", "VIP", "Correct Score"]
    : ["Free", "VIP", "Correct Score", "Custom"];

  const dayTabs = ["Yesterday", "Today", "Tomorrow"];

  // ✅ Handle type selection
  const handleTypeSelect = (tab) => {
    if (tab === "VIP") setActiveType("VIP");
    else if (tab === "Correct Score") setActiveType("Correct Score");
    else setActiveType(tab);
  };

  // ✅ Handle custom date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setActiveDay("Custom"); // highlight that user picked a custom date
  };

  return (
    <div className="space-y-4">
      {/* 🗓 Day Filter */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {dayTabs.map((tab) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={tab}
            onClick={() => {
              setActiveDay(tab);
              setSelectedDate(null); // reset calendar when using preset day
            }}
            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
              activeDay === tab
                ? "bg-[#FFD601] text-[#142B6F] border-[#FFD601] shadow-lg"
                : "bg-white/5 text-white/90 border-white/10 hover:bg-white/10"
            }`}
          >
            {tab}
          </motion.button>
        ))}

        {/* 📅 Calendar Date Picker */}
        <motion.input
          whileTap={{ scale: 0.97 }}
          type="date"
          value={selectedDate || ""}
          onChange={handleDateChange}
          className="bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 rounded-xl px-3 py-2 outline-none cursor-pointer"
        />
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
