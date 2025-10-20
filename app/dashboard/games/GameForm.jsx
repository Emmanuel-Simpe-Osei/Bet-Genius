"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameForm({ onGameAdded, showToast }) {
  const [bookingCode, setBookingCode] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [gameType, setGameType] = useState("Free");
  const [totalOdds, setTotalOdds] = useState("");
  const [price, setPrice] = useState("");

  // 🔑 Key generator for stable React rendering
  const getMatchKey = (match, index) =>
    match.eventId
      ? `${match.eventId}-${index}`
      : `${match.homeTeam}-${match.awayTeam}-${index}`.replace(/\s+/g, "-");

  // 🎯 Load matches from SportyBet API
  const handleLoad = async () => {
    if (!bookingCode.trim()) {
      showToast?.("Please enter a booking code", "warning");
      return;
    }

    setLoading(true);
    console.log("🔄 Fetching booking:", bookingCode);

    try {
      const res = await fetch(`/api/sportybet/${bookingCode}`);
      const data = await res.json();

      console.log("✅ Booking response:", data);

      if (!data.matches?.length) {
        showToast?.("No matches found for this booking code", "error");
        setMatches([]);
        setTotalOdds("");
        return;
      }

      const editableMatches = data.matches.map((m) => ({
        ...m,
        status: "Pending",
      }));

      const calculatedOdds = editableMatches.reduce((acc, m) => {
        const val = parseFloat(m.odds);
        return acc * (isNaN(val) ? 1 : val);
      }, 1);

      setMatches(editableMatches);
      setTotalOdds(calculatedOdds.toFixed(2));
      showToast?.(
        `${editableMatches.length} matches loaded successfully!`,
        "success"
      );
    } catch (error) {
      console.error("❌ Error fetching booking:", error);
      showToast?.("Failed to load booking. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Upload game via API (not direct Supabase)
  const handleUpload = async () => {
    if (!bookingCode.trim())
      return showToast?.("Booking code is required", "warning");
    if (matches.length === 0)
      return showToast?.("No matches to upload", "warning");
    if (!totalOdds || !price)
      return showToast?.("Enter total odds and price", "warning");

    setUploading(true);
    console.log("🚀 Starting upload process...");

    try {
      const normalizedType = (() => {
        const t = gameType.toLowerCase();
        if (t.includes("custom vip")) return "custom vip";
        if (t.includes("custom correct")) return "custom correct score";
        if (t.includes("recovery")) return "recovery";
        return t;
      })();

      const now = new Date().toISOString();
      const payload = {
        booking_code: bookingCode.trim().toUpperCase(),
        game_type: normalizedType,
        game_name: `${normalizedType.toUpperCase()} - ${bookingCode.trim()}`,
        total_odds: parseFloat(totalOdds),
        price: parseFloat(price),
        status: "pending",
        match_data: matches,
        created_at: now,
        updated_at: now,
      };

      console.log("🧱 Prepared payload:", payload);

      const response = await fetch("/api/games/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📡 API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      showToast?.("✅ Game uploaded successfully!", "success");

      // Reset form
      setMatches([]);
      setBookingCode("");
      setPrice("");
      setTotalOdds("");
      setGameType("Free");
      onGameAdded?.();
    } catch (err) {
      console.error("💥 Upload failed:", err);
      showToast?.(`❌ Upload failed: ${err.message}`, "error");
    } finally {
      setUploading(false);
      console.log("🏁 Upload complete.");
    }
  };

  // ⚙️ Update match status manually
  const handleStatusChange = (index, value) => {
    const updated = [...matches];
    updated[index].status = value;
    setMatches(updated);
  };

  return (
    <motion.div
      id="game-form-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#142B6F] rounded-2xl shadow-lg border border-[#FFD601]/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#142B6F] border-b border-[#FFD601]/30 p-6 text-white">
        <h2 className="text-xl font-bold text-[#FFD601]">Upload New Game</h2>
        <p className="text-white/70 text-sm">Add betting tips from SportyBet</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Booking Code Input */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            SportyBet Booking Code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter booking code..."
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLoad()}
              className="flex-1 px-4 py-3 rounded-xl bg-[#1b2f7e] border border-[#FFD601]/40 text-white placeholder-white/50 focus:ring-2 focus:ring-[#FFD601]/40 focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLoad}
              disabled={loading}
              className="bg-[#FFD601] text-[#142B6F] px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-[#142B6F] border-t-transparent rounded-full mr-2"></div>
                  Loading...
                </span>
              ) : (
                "Load Matches"
              )}
            </motion.button>
          </div>
        </div>

        {/* Matches + Settings */}
        <AnimatePresence>
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Game Settings */}
              <div className="bg-[#1b2f7e] border border-[#FFD601]/30 rounded-xl p-4 text-white">
                <h3 className="font-semibold text-[#FFD601] mb-3">
                  Game Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Game Type</label>
                    <select
                      value={gameType}
                      onChange={(e) => setGameType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#142B6F] border border-[#FFD601]/30 text-white focus:ring-2 focus:ring-[#FFD601]/40"
                    >
                      <option value="Free">Free</option>
                      <option value="VIP">VIP</option>
                      <option value="Correct Score">Correct Score</option>
                      <option value="Custom VIP">Custom VIP</option>
                      <option value="Custom Correct Score">
                        Custom Correct Score
                      </option>
                      <option value="Recovery">Recovery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Total Odds *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalOdds}
                      onChange={(e) => setTotalOdds(e.target.value)}
                      placeholder="Auto-calculated"
                      className="w-full px-3 py-2 rounded-lg bg-[#142B6F] border border-[#FFD601]/30 text-white placeholder-white/50 focus:ring-2 focus:ring-[#FFD601]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Price (₵) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg bg-[#142B6F] border border-[#FFD601]/30 text-white placeholder-white/50 focus:ring-2 focus:ring-[#FFD601]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Matches */}
              <div className="text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Matches ({matches.length})
                  </h3>
                  <span className="px-3 py-1 bg-[#FFD601] text-[#142B6F] rounded-full text-sm font-semibold">
                    Total Odds: {totalOdds}
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {matches.map((match, i) => (
                    <motion.div
                      key={getMatchKey(match, i)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-[#142B6F] border border-[#FFD601]/30 p-4 rounded-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-white text-sm">
                            {match.homeTeam} vs {match.awayTeam}
                          </h4>
                          {match.league && (
                            <p className="text-xs text-white/70">
                              {match.league}
                            </p>
                          )}
                          {match.odds && (
                            <p className="text-xs text-[#FFD601] font-medium mt-1">
                              Odds: {match.odds}
                            </p>
                          )}
                        </div>

                        <select
                          value={match.status}
                          onChange={(e) =>
                            handleStatusChange(i, e.target.value)
                          }
                          className="px-3 py-2 rounded-lg bg-[#1b2f7e] border border-[#FFD601]/30 text-white text-sm focus:ring-2 focus:ring-[#FFD601]/40"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <div className="pt-4 border-t border-[#FFD601]/20">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-[#FFD601] text-[#142B6F] font-bold py-3 rounded-xl disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-2 border-[#142B6F] border-t-transparent rounded-full mr-2"></div>
                      Uploading Game...
                    </span>
                  ) : (
                    "Upload Game"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
