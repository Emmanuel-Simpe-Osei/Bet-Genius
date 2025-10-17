"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

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

  // Update individual match status
  const handleStatusChange = (index, newStatus) => {
    const updated = matches.map((m, i) =>
      i === index ? { ...m, status: newStatus } : m
    );
    setMatches(updated);
  };

  // Save updated matches + total odds
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
      showToast?.("❌ Failed to update game: " + error.message, "error");
      return;
    }
    setEditing(false);
    showToast?.("✅ Game updated successfully!", "success");
    onStatusChange();
  };

  // Delete game card
  const deleteGame = async () => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    setDeleting(true);
    const { error } = await supabase.from("games").delete().eq("id", game.id);
    setDeleting(false);

    if (error) {
      showToast?.("❌ Delete failed: " + error.message, "error");
      return;
    }
    showToast?.("🗑 Game deleted successfully!", "success");
    onDelete();
  };

  // Status color + icon
  const statusColor = (status) =>
    status === "Won"
      ? "text-green-400"
      : status === "Lost"
      ? "text-red-400"
      : "text-white"; // Pending = white

  const statusIcon = (status) =>
    status === "Won" ? "✅" : status === "Lost" ? "❌" : "⏳";

  const statusCounts = matches.reduce(
    (acc, m) => ({ ...acc, [m.status]: (acc[m.status] || 0) + 1 }),
    { Won: 0, Lost: 0, Pending: 0 }
  );

  const getMatchKey = (match, i) =>
    match.eventId
      ? `${match.eventId}-${i}`
      : `${match.homeTeam}-${match.awayTeam}-${i}`.replace(/\s+/g, "-");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -12 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border"
      style={{ backgroundColor: NAVY, color: "#fff", borderColor: `${GOLD}33` }} // 20% opacity
    >
      {/* Header */}
      <div
        className="p-4 flex justify-between items-start border-b"
        style={{ borderColor: `${GOLD}33` }}
      >
        <div className="space-y-1">
          <div
            className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
            style={{ backgroundColor: GOLD, color: NAVY }}
          >
            {game.game_type}
          </div>
          <div className="text-sm opacity-80">Booking: {game.booking_code}</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-lg font-bold" style={{ color: GOLD }}>
            ₵{game.price || "0"}
          </div>
          <div className="text-xs opacity-70">Odds: {totalOdds}</div>
        </div>
      </div>

      {/* Summary + Actions */}
      <div
        className="px-4 py-2 flex items-center justify-between border-b text-xs"
        style={{ borderColor: `${GOLD}26`, backgroundColor: "#1a308d" }}
      >
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-green-400">
            ✅ {statusCounts.Won}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            ❌ {statusCounts.Lost}
          </span>
          <span className="flex items-center gap-1 text-white">
            ⏳ {statusCounts.Pending}
          </span>
        </div>

        {!editing ? (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-1 rounded text-xs font-semibold"
            style={{ backgroundColor: GOLD, color: NAVY }}
            onClick={() => setEditing(true)}
          >
            ✏️ Edit
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              onClick={saveChanges}
              className="px-3 py-1 rounded text-xs font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#22c55e" }} // green-500
            >
              {saving ? "Saving..." : "Save"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              disabled={deleting}
              onClick={deleteGame}
              className="px-3 py-1 rounded text-xs font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#ef4444" }} // red-500
            >
              {deleting ? "..." : "Delete"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditing(false)}
              className="px-3 py-1 rounded text-xs font-semibold"
              style={{ color: GOLD, borderColor: `${GOLD}66`, borderWidth: 1 }}
            >
              Cancel
            </motion.button>
          </div>
        )}
      </div>

      {/* Matches */}
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {matches.map((match, i) => (
            <motion.div
              key={getMatchKey(match, i)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between rounded-xl px-3 py-2 transition-all"
              style={{
                backgroundColor: "#1a308d",
                border: `1px solid ${GOLD}1A`, // 10% opacity
              }}
            >
              <div className="text-sm">
                <p className="font-medium">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                {match.league && (
                  <p className="text-xs opacity-70">{match.league}</p>
                )}
              </div>

              {editing ? (
                <select
                  value={match.status}
                  onChange={(e) => handleStatusChange(i, e.target.value)}
                  className="rounded text-xs px-2 py-1"
                  style={{
                    backgroundColor: NAVY,
                    color: "#fff",
                    border: `1px solid ${GOLD}4D`, // 30%
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              ) : (
                <span className={`text-lg ${statusColor(match.status)}`}>
                  {statusIcon(match.status)}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {matches.length === 0 && (
          <p
            className="text-center text-sm py-4"
            style={{ color: "#ffffff99" }}
          >
            ⚽ No matches
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-3 flex justify-between items-center text-xs border-t"
        style={{ borderColor: `${GOLD}26`, color: "#ffffffb3" }}
      >
        <span>{new Date(game.created_at).toLocaleDateString()}</span>
        <span
          className="px-2 py-1 rounded font-medium"
          style={
            game.status === "won"
              ? { backgroundColor: "#22c55e33", color: "#86efac" } // green-500/20 + green-300
              : game.status === "lost"
              ? { backgroundColor: "#ef444433", color: "#fca5a5" } // red-500/20 + red-300
              : { backgroundColor: "#ffffff1a", color: "#fff" } // pending = white-ish
          }
        >
          {game.status}
        </span>
      </div>
    </motion.div>
  );
}
