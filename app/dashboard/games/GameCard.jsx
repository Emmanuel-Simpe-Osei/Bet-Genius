"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function GameCard({
  game,
  onStatusChange,
  onDelete,
  showToast,
}) {
  const [editing, setEditing] = useState(false);
  const [matches, setMatches] = useState(game.match_data || []);
  const [totalOdds, setTotalOdds] = useState(game.total_odds);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🧮 Update individual match status
  const handleStatusChange = (index, newStatus) => {
    const updated = matches.map((m, i) =>
      i === index ? { ...m, status: newStatus } : m
    );
    setMatches(updated);
  };

  // 💾 Save updated matches + total odds
  const saveChanges = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("games")
      .update({
        match_data: matches,
        total_odds: totalOdds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", game.id);
    setSaving(false);

    if (error) {
      if (showToast) {
        showToast("❌ Failed to update game: " + error.message, "error");
      } else {
        alert("❌ Failed to update game: " + error.message);
      }
      console.error(error);
      return;
    }

    setEditing(false);
    if (showToast) {
      showToast("✅ Game updated successfully!", "success");
    } else {
      alert("✅ Game updated successfully!");
    }
    onStatusChange();
  };

  // 🗑 Delete game card
  const deleteGame = async () => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    setDeleting(true);
    const { error } = await supabase.from("games").delete().eq("id", game.id);
    setDeleting(false);

    if (error) {
      if (showToast) {
        showToast("❌ Delete failed: " + error.message, "error");
      } else {
        alert("❌ Delete failed: " + error.message);
      }
      return;
    }

    if (showToast) {
      showToast("🗑 Game deleted successfully!", "success");
    } else {
      alert("🗑 Game deleted successfully!");
    }
    onDelete();
  };

  // 🎯 Get status color and icon
  const getStatusStyle = (status) => {
    const styles = {
      Won: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: "✅",
      },
      Lost: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: "❌",
      },
      Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: "⏳",
      },
    };
    return styles[status] || styles.Pending;
  };

  // 📊 Calculate win/loss/pending counts
  const statusCounts = matches.reduce((acc, match) => {
    acc[match.status] = (acc[match.status] || 0) + 1;
    return acc;
  }, {});

  // 🔑 Generate unique key for each match
  const getMatchKey = (match, index) => {
    // Use eventId if available and unique, otherwise create a composite key
    if (match.eventId) {
      return `${match.eventId}-${index}`;
    }
    // Fallback: use teams and index to create unique key
    return `${match.homeTeam}-${match.awayTeam}-${index}`.replace(/\s+/g, "-");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* 🎯 Compact Header */}
      <div className="bg-gradient-to-r from-[#002583] to-blue-700 p-3 text-white">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                {game.game_type}
              </span>
              <span className="text-blue-100 text-xs">{game.booking_code}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-90">
                {matches.length} match{matches.length !== 1 ? "es" : ""}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">₵{game.price || "0"}</div>
                <div className="text-xs opacity-80">Odds: {totalOdds}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Quick Actions Bar */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {statusCounts.Won > 0 && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                ✅{statusCounts.Won}
              </span>
            )}
            {statusCounts.Lost > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                ❌{statusCounts.Lost}
              </span>
            )}
            {statusCounts.Pending > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                ⏳{statusCounts.Pending}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Edit Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(!editing)}
              className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              {editing ? "✕ Cancel" : "✏️ Edit"}
            </motion.button>

            {/* Quick Actions when editing */}
            {editing && (
              <div className="flex space-x-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveChanges}
                  disabled={saving}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded disabled:opacity-50 transition-colors"
                >
                  {saving ? "💾" : "Save"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={deleteGame}
                  disabled={deleting}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50 transition-colors"
                >
                  {deleting ? "🗑" : "Delete"}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🏆 Compact Matches List */}
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {matches.map((match, index) => {
            const statusStyle = getStatusStyle(match.status);
            return (
              <motion.div
                key={getMatchKey(match, index)} // 🔑 Fixed: Using unique key
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`p-2 rounded-lg border ${statusStyle.bg} transition-all duration-200`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {match.homeTeam} vs {match.awayTeam}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {match.league && (
                        <div className="text-xs text-gray-500 truncate">
                          {match.league}
                        </div>
                      )}
                      {match.odds && (
                        <div className="text-xs text-[#002583] font-medium">
                          {match.odds}
                        </div>
                      )}
                    </div>
                  </div>

                  {editing ? (
                    <select
                      value={match.status}
                      onChange={(e) =>
                        handleStatusChange(index, e.target.value)
                      }
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${statusStyle.text} ${statusStyle.bg} border-0 focus:ring-1 focus:ring-opacity-50`}
                    >
                      <option value="Pending">⏳</option>
                      <option value="Won">✅</option>
                      <option value="Lost">❌</option>
                    </select>
                  ) : (
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${statusStyle.text}`}
                    >
                      {statusStyle.icon}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* 📱 Empty Matches State */}
        {matches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 text-gray-400"
          >
            <div className="text-lg mb-1">⚽</div>
            <p className="text-xs">No matches</p>
          </motion.div>
        )}
      </div>

      {/* 📅 Compact Footer */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{new Date(game.created_at).toLocaleDateString()}</span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              game.status === "won"
                ? "bg-green-100 text-green-700"
                : game.status === "lost"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {game.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
