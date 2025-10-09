"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function GameForm({ onGameAdded, showToast }) {
  const [bookingCode, setBookingCode] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [gameType, setGameType] = useState("Free");
  const [totalOdds, setTotalOdds] = useState("");
  const [price, setPrice] = useState("");

  // ✅ Generate unique key for each match
  const getMatchKey = (match, index) => {
    // Use eventId + index to ensure uniqueness even if eventIds are duplicated
    if (match.eventId) {
      return `${match.eventId}-${index}`;
    }
    // Fallback: use teams and index to create unique key
    const teamKey = `${match.homeTeam}-${match.awayTeam}`.replace(/\s+/g, "-");
    return `${teamKey}-${index}`;
  };

  // ✅ Load matches from SportyBet API
  const handleLoad = async () => {
    if (!bookingCode.trim()) {
      if (showToast) {
        showToast("📝 Please enter a booking code", "warning");
      } else {
        alert("Please enter a booking code.");
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/sportybet/${bookingCode}`);
      const data = await res.json();

      if (!data.matches || data.matches.length === 0) {
        if (showToast) {
          showToast("❌ No matches found for this booking code", "error");
        } else {
          alert("No matches found for this booking code.");
        }
        setMatches([]);
        setTotalOdds("");
        return;
      }

      const editableMatches = data.matches.map((m) => ({
        ...m,
        status: "Pending",
      }));

      // ✅ Auto-calculate total odds
      const calculatedOdds = editableMatches.reduce((acc, m) => {
        const val = parseFloat(m.odds);
        return acc * (isNaN(val) ? 1 : val);
      }, 1);

      setMatches(editableMatches);
      setTotalOdds(calculatedOdds.toFixed(2));

      if (showToast) {
        showToast(
          `🎮 Loaded ${editableMatches.length} matches successfully!`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      if (showToast) {
        showToast("😞 Failed to load booking. Please try again.", "error");
      } else {
        alert("Failed to load booking. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload the full booking as one game row
  const handleUpload = async () => {
    if (matches.length === 0) {
      if (showToast) {
        showToast("⚽ No matches to upload", "warning");
      } else {
        alert("No matches to upload.");
      }
      return;
    }
    if (!totalOdds || !price) {
      if (showToast) {
        showToast("💰 Please enter total odds and price", "warning");
      } else {
        alert("Please enter total odds and price before uploading.");
      }
      return;
    }

    setUploading(true);

    try {
      const gameToUpload = {
        booking_code: bookingCode,
        game_type: gameType,
        total_odds: parseFloat(totalOdds),
        price: parseFloat(price),
        status: "pending",
        match_data: matches,
      };

      const { error } = await supabase.from("games").insert([gameToUpload]);

      if (error) throw error;

      if (showToast) {
        showToast("✅ Game uploaded successfully!", "success");
      } else {
        alert("✅ Game uploaded successfully!");
      }

      // Reset form
      setMatches([]);
      setBookingCode("");
      setPrice("");
      setTotalOdds("");
      setGameType("Free");

      // Refresh parent component
      if (onGameAdded) {
        console.log("🔄 Calling onGameAdded to refresh games list...");
        onGameAdded();
      } else {
        console.warn("⚠️ onGameAdded callback is not provided");
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      if (showToast) {
        showToast("❌ Failed to upload game. Please try again.", "error");
      } else {
        alert("❌ Failed to upload game. Check console for details.");
      }
    } finally {
      setUploading(false);
    }
  };

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
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* 🎯 Header */}
      <div className="bg-gradient-to-r from-[#002583] to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎮</div>
          <div>
            <h2 className="text-2xl font-bold">Upload New Game</h2>
            <p className="text-blue-100 opacity-90">
              Add betting tips from SportyBet
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 🔍 Booking Code Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <label className="block text-sm font-semibold text-gray-700">
            🔑 SportyBet Booking Code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter your booking code here..."
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#002583] focus:ring-2 focus:ring-[#002583]/20 focus:outline-none transition-all duration-300"
              onKeyPress={(e) => e.key === "Enter" && handleLoad()}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoad}
              disabled={loading}
              className="bg-gradient-to-r from-[#002583] to-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Loading...
                </span>
              ) : (
                "🚀 Load Matches"
              )}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* 🎯 Game Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <h3 className="font-semibold text-blue-800 mb-3">
                  Game Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🎯 Game Type
                    </label>
                    <select
                      value={gameType}
                      onChange={(e) => setGameType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#002583] focus:ring-1 focus:ring-[#002583]/20 focus:outline-none transition-all duration-200"
                    >
                      <option value="Free">🎉 Free Tips</option>
                      <option value="VIP">⭐ VIP Tips</option>
                      <option value="Correct Score">🎯 Correct Score</option>
                      <option value="Custom">🔧 Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📊 Total Odds *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalOdds}
                      onChange={(e) => setTotalOdds(e.target.value)}
                      placeholder="Auto-calculated"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#002583] focus:ring-1 focus:ring-[#002583]/20 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      💰 Price (₵) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#002583] focus:ring-1 focus:ring-[#002583]/20 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </motion.div>

              {/* ⚽ Matches List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    ⚽ Matches ({matches.length})
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Total Odds: {totalOdds}
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {matches.map((match, i) => (
                    <motion.div
                      key={getMatchKey(match, i)} // ✅ FIXED: Using unique key function
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#002583]/30 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {match.homeTeam} vs {match.awayTeam}
                          </h4>
                          {match.league && (
                            <p className="text-xs text-gray-500 mt-1">
                              {match.league}
                            </p>
                          )}
                          {match.odds && (
                            <p className="text-xs text-[#002583] font-medium mt-1">
                              Odds: {match.odds}
                            </p>
                          )}
                        </div>

                        <select
                          value={match.status}
                          onChange={(e) =>
                            handleStatusChange(i, e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#002583] focus:ring-1 focus:ring-[#002583]/20 focus:outline-none transition-all duration-200 text-sm min-w-32"
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Won">✅ Won</option>
                          <option value="Lost">❌ Lost</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* 🚀 Upload Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 pt-4 border-t border-gray-200"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Uploading Game...
                    </span>
                  ) : (
                    "🚀 Upload Game"
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
