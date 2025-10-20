"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FiltersBar({
  activeType,
  setActiveType,
  activeDay,
  setActiveDay,
  hideCustom = false,
  selectedDate,
  setSelectedDate,
}) {
  const [mounted, setMounted] = useState(false);

  // ✅ Wait until client mount
  useEffect(() => setMounted(true), []);

  const typeTabs = hideCustom
    ? ["Free", "VIP", "Correct Score"]
    : ["Free", "VIP", "Correct Score", "Custom"];

  const dayTabs = ["Yesterday", "Today", "Tomorrow"];

  const handleTypeSelect = (tab) => {
    if (tab === "VIP") setActiveType("VIP");
    else if (tab === "Correct Score") setActiveType("Correct Score");
    else setActiveType(tab);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setActiveDay("Custom");
  };

  // ✅ Avoid hydration mismatch by skipping SSR render
  if (!mounted) {
    return (
      <div className="text-center text-white/50 py-4 animate-pulse">
        Loading filters...
      </div>
    );
  }

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
              setSelectedDate(null);
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

        {/* 📅 Cross-browser Date Picker */}
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 rounded-xl px-3 py-[6px] cursor-pointer"
        >
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MM/dd/yyyy"
            placeholderText="Pick date"
            className="bg-transparent text-white outline-none w-full"
            popperClassName="react-datepicker-popper"
            calendarClassName="!bg-white !text-black rounded-lg p-2 shadow-lg"
          />
        </motion.div>
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
