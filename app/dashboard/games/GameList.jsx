"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Trash2 } from "lucide-react";

export default function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch all games when page loads
  useEffect(() => {
    fetchGames();
  }, []);

  // ✅ Get all games from Supabase
  async function fetchGames() {
    setLoading(true);
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching games:", error);
      setGames([]);
    } else {
      setGames(data);
    }
    setLoading(false);
  }

  // ✅ Update the match status inside match_data JSONB
  async function handleStatusChange(gameId, matchIndex, newStatus) {
    setUpdating(true);
    try {
      // Find the game being updated
      const game = games.find((g) => g.id === gameId);
      const updatedMatches = [...game.match_data];
      updatedMatches[matchIndex].status = newStatus;

      // Update in Supabase
      const { error } = await supabase
        .from("games")
        .update({ match_data: updatedMatches })
        .eq("id", gameId);

      if (error) throw error;

      // Update locally
      const updatedGames = games.map((g) =>
        g.id === gameId ? { ...g, match_data: updatedMatches } : g
      );
      setGames(updatedGames);
    } catch (err) {
      console.error("Error updating match status:", err);
    } finally {
      setUpdating(false);
    }
  }

  // ✅ Delete a full game card (booking)
  async function handleDelete(gameId) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const { error } = await supabase.from("games").delete().eq("id", gameId);
    if (error) {
      console.error("Error deleting game:", error);
      alert("Failed to delete.");
    } else {
      setGames(games.filter((g) => g.id !== gameId));
      alert("Deleted successfully.");
    }
  }

  // 🧭 UI Rendering
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#002583] mb-6">Uploaded Games</h1>

      {loading ? (
        <p className="text-gray-600">Loading games...</p>
      ) : games.length === 0 ? (
        <p className="text-gray-500">No games uploaded yet.</p>
      ) : (
        <div className="space-y-6">
          {games.map((game) => (
            <motion.div
              key={game.id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-5"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Header Info */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#002583]">
                    Booking: {game.booking_code}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Type: {game.game_type} | Total Odds:{" "}
                    <span className="font-semibold text-black">
                      {game.total_odds}
                    </span>{" "}
                    | Price: ₵{game.price}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete Booking"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Matches */}
              <div className="space-y-3">
                {game.match_data.map((match, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[#002583]">
                        {match.homeTeam} vs {match.awayTeam}
                      </p>
                      <select
                        value={match.status}
                        onChange={(e) =>
                          handleStatusChange(game.id, index, e.target.value)
                        }
                        className="border px-3 py-1 rounded-md bg-white text-sm"
                        disabled={updating}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Created: {new Date(game.created_at).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
