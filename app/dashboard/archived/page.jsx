"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import GameCard from "../games/GameCard"; // ✅ reuse same card component

const ArchivedPage = () => {
  const [archivedGames, setArchivedGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  // ✅ Fetch archived games
  const fetchArchivedGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArchivedGames(data || []);
    } catch (err) {
      console.error("Error fetching archived games:", err.message);
      setMessage("⚠️ Failed to load archived games.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🧹 Restore a game
  const restoreGame = async (id) => {
    try {
      const { error } = await supabase
        .from("games")
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;
      setMessage("✅ Game restored successfully!");
      fetchArchivedGames();
    } catch (err) {
      setMessage("⚠️ Failed to restore game.");
      console.error("Restore error:", err.message);
    }
  };

  // 🗑️ Delete permanently
  const deleteGame = async (id) => {
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

  const filtered = archivedGames.filter(
    (game) =>
      game.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.game_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#142B6F]/5 p-6">
      {/* HEADER */}
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
          View and manage games that have been archived automatically.
        </p>
      </motion.div>

      {/* SEARCH */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search archived games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FFD601] focus:ring-2 focus:ring-[#FFD601]/30 outline-none transition-all duration-300 bg-white shadow-sm text-gray-800"
        />
      </div>

      {/* STATUS MESSAGE */}
      {message && (
        <div className="text-center mb-4 text-sm text-gray-700 font-medium">
          {message}
        </div>
      )}

      {/* GRID */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl shadow p-4 border border-gray-100"
            >
              <GameCard game={game} />
              <div className="flex items-center justify-between mt-4">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedPage;
