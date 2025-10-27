"use client";
import { useEffect, useState } from "react";
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
  const [totalOdds, setTotalOdds] = useState(game.total_odds || 0);
  const [price, setPrice] = useState(game.price || 0);
  const [gameType, setGameType] = useState(game.game_type || "free");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mainStatus, setMainStatus] = useState(game.status || "active");

  // ✅ NEW: Check if this game has been purchased by any user
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const checkIfPurchased = async () => {
      try {
        const { data, error } = await supabase
          .from("purchases")
          .select("id")
          .eq("game_id", game.id)
          .eq("is_purchased", true);

        if (error) throw error;
        setIsPurchased(data && data.length > 0);
      } catch (err) {
        console.error("Error checking purchase:", err.message);
      }
    };

    checkIfPurchased();
  }, [game.id]);

  const gameTypes = [
    { label: "Free", value: "free" },
    { label: "VIP", value: "vip" },
    { label: "Correct Score", value: "correct score" },
    { label: "Custom VIP", value: "custom vip" },
    { label: "Custom Correct Score", value: "custom correct score" },
    { label: "Recovery", value: "recovery" },
  ];

  const handleStatusChange = (index, newStatus) => {
    const updated = matches.map((m, i) =>
      i === index ? { ...m, status: newStatus } : m
    );
    setMatches(updated);
  };

  const saveChanges = async () => {
    setSaving(true);

    const validTypes = gameTypes.map((t) => t.value);
    if (!validTypes.includes(gameType)) {
      showToast?.("⚠️ Invalid game type selected.", "error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("games")
      .update({
        match_data: matches,
        total_odds: Number(totalOdds),
        price: Number(price),
        game_type: gameType.trim().toLowerCase(),
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
    onStatusChange?.();
  };

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
    onDelete?.();
  };

  const statusColor = (status) =>
    status === "Won"
      ? "text-green-400"
      : status === "Lost"
      ? "text-red-400"
      : "text-white";

  const statusIcon = (status) =>
    status === "Won" ? "✅" : status === "Lost" ? "❌" : "⏳";

  const statusCounts = matches.reduce(
    (acc, m) => ({ ...acc, [m.status]: (acc[m.status] || 0) + 1 }),
    { Won: 0, Lost: 0, Pending: 0 }
  );

  const getMatchKey = (match, i) => {
    const base =
      match.eventId ||
      `${match.homeTeam || "teamA"}-${match.awayTeam || "teamB"}-${i}`;
    return base.replace(/\s+/g, "-") + "-" + i;
  };

  useEffect(() => {
    if (!matches.length) return;

    const allResolved = matches.every(
      (m) =>
        m.status?.toLowerCase() === "won" || m.status?.toLowerCase() === "lost"
    );
    const hasPending = matches.some(
      (m) => m.status?.toLowerCase() === "pending"
    );

    if (allResolved && !hasPending && mainStatus !== "archived") {
      setMainStatus("archived");

      (async () => {
        const { error } = await supabase
          .from("games")
          .update({
            status: "archived",
            archived_at: new Date().toISOString(),
          })
          .eq("id", game.id);

        if (error) {
          console.error("Error updating archive:", error.message);
          showToast?.("❌ Failed to archive game automatically.", "error");
        } else {
          showToast?.("✅ Game archived automatically!", "success");
          onStatusChange?.();
        }
      })();
    }
  }, [matches]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -12 }}
      whileHover={{ y: -2 }}
      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border"
      style={{ backgroundColor: NAVY, color: "#fff", borderColor: `${GOLD}33` }}
    >
      {/* ✅ Show tick if game was purchased */}
      {isPurchased && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
          ✅ Purchased
        </div>
      )}

      {/* 🧩 Header */}
      <div
        className="p-4 border-b space-y-2"
        style={{ borderColor: `${GOLD}33` }}
      >
        {!editing ? (
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div
                className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
              </div>
              <div className="text-sm opacity-80">
                Booking: {game.booking_code}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-lg font-bold" style={{ color: GOLD }}>
                ₵{price}
              </div>
              <div className="text-xs opacity-70">Odds: {totalOdds}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="rounded w-full px-2 py-1 text-xs font-semibold border border-[#FFD601] bg-white text-[#142B6F]"
            >
              <option value="">-- Select Game Type --</option>
              {gameTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Edit Price (₵)"
              className="rounded w-full px-2 py-1 text-xs text-[#142B6F] font-semibold border border-[#FFD601] bg-white"
            />

            <input
              type="number"
              value={totalOdds}
              onChange={(e) => setTotalOdds(e.target.value)}
              placeholder="Edit Total Odds"
              className="rounded w-full px-2 py-1 text-xs text-[#142B6F] font-semibold border border-[#FFD601] bg-white"
            />

            <input
              type="text"
              value={game.booking_code}
              readOnly
              className="rounded w-full px-2 py-1 text-xs text-[#FFD601]/80 font-semibold border border-[#FFD601]/50 bg-[#1a308d]"
            />
          </div>
        )}
      </div>

      {/* ⚙️ Status Summary + Actions */}
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
              style={{ backgroundColor: "#22c55e" }}
            >
              {saving ? "Saving..." : "Save"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              disabled={deleting}
              onClick={deleteGame}
              className="px-3 py-1 rounded text-xs font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#ef4444" }}
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

      {/* ⚽ Matches */}
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
                border: `1px solid ${GOLD}1A`,
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
                    border: `1px solid ${GOLD}4D`,
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

      {/* 📅 Footer */}
      <div
        className="p-3 flex justify-between items-center text-xs border-t"
        style={{ borderColor: `${GOLD}26`, color: "#ffffffb3" }}
      >
        <span>{new Date(game.created_at).toLocaleDateString()}</span>
        <span
          className="px-2 py-1 rounded font-medium capitalize"
          style={
            mainStatus === "archived"
              ? { backgroundColor: "#22c55e33", color: "#86efac" }
              : mainStatus === "lost"
              ? { backgroundColor: "#ef444433", color: "#fca5a5" }
              : { backgroundColor: "#ffffff1a", color: "#fff" }
          }
        >
          {mainStatus}
        </span>
      </div>
    </motion.div>
  );
}
