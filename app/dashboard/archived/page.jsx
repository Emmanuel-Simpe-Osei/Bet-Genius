"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import GameCard from "../games/GameCard";

export default function ArchivedPage() {
  const [archivedGames, setArchivedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  // 🧭 Fetch archived games
  const fetchArchivedGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("status", "archived")
        .order("archived_at", { ascending: false });

      if (error) throw error;
      setArchivedGames(data || []);
    } catch (err) {
      console.error("Error fetching archived games:", err.message);
      setMessage("⚠️ Failed to load archived games.");
    } finally {
      setIsLoading(false);
    }
  };

  // ♻️ Restore archived game
  const restoreGame = async (id) => {
    try {
      const { error } = await supabase
        .from("games")
        .update({ status: "active", archived_at: null })
        .eq("id", id);
      if (error) throw error;

      setMessage("✅ Game restored successfully!");
      fetchArchivedGames();
    } catch (err) {
      console.error("Restore error:", err.message);
      setMessage("⚠️ Failed to restore game.");
    }
  };

  // 🗑️ Permanently delete
  const deleteGame = async (id) => {
    if (!confirm("Are you sure you want to delete this game permanently?"))
      return;

    try {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;

      setMessage("🗑️ Game deleted permanently.");
      fetchArchivedGames();
    } catch (err) {
      console.error("Delete error:", err.message);
      setMessage("⚠️ Failed to delete game.");
    }
  };

  useEffect(() => {
    fetchArchivedGames();
  }, []);

  // 🔍 Search filter
  const filtered = archivedGames.filter(
    (game) =>
      game.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.game_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🕓 Helper for "time since archived"
  const timeSinceArchived = (archived_at) => {
    if (!archived_at) return "Unknown";
    const diffMs = Date.now() - new Date(archived_at).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Archived today";
    if (diffDays === 1) return "Archived 1 day ago";
    return `Archived ${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#142B6F]/5 p-6">
      {/* 🧭 HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-2 mb-8"
      >
        <h1 className="text-3xl font-semibold text-[#142B6F]">
          Archived Games
        </h1>
        <p className="text-gray-500 text-sm">
          View, restore, or permanently delete automatically archived games.
        </p>
      </motion.div>

      {/* 🔍 SEARCH */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search archived games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FFD601] focus:ring-2 focus:ring-[#FFD601]/30 outline-none transition-all duration-300 bg-white shadow-sm text-gray-800"
        />
      </div>

      {/* 🗨️ STATUS MESSAGE */}
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4 text-sm text-gray-700 font-medium"
        >
          {message}
        </motion.div>
      )}

      {/* 🎯 GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-56 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No archived games found.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow p-4 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <GameCard game={game} />

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between mt-4 border-t pt-3 text-sm">
                  <span className="text-gray-500 text-xs">
                    {timeSinceArchived(game.archived_at)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreGame(game.id)}
                      className="px-3 py-1 rounded-md text-sm bg-green-100 text-green-700 hover:bg-green-200 transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteGame(game.id)}
                      className="px-3 py-1 rounded-md text-sm bg-red-100 text-red-700 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
