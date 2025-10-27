"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GameForm from "./GameForm";
import GameCard from "./GameCard";
import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type = "success", onClose }) => {
  const colors = {
    success: "border-green-500 bg-green-50 text-green-800",
    error: "border-red-500 bg-red-50 text-red-800",
    warning: "border-yellow-500 bg-yellow-50 text-yellow-800",
    info: "border-blue-500 bg-blue-50 text-blue-800",
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-xl shadow-md border-l-4 ${colors[type]}`}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">{message}</p>
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const makeId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const showToast = (message, type = "success", duration = 4000) => {
    const id = makeId();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, showToast, removeToast };
};

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => setIsClient(true), []);

  const gameAllResolved = (matchData) => {
    const matches = Array.isArray(matchData) ? matchData : [];
    if (matches.length === 0) return false;
    return matches.every((m) => {
      const s = m?.status?.toLowerCase?.() ?? "";
      return s === "won" || s === "lost";
    });
  };

  useEffect(() => {
    const cleanupLifecycle = async () => {
      try {
        const { data: allGames, error: fetchError } = await supabase
          .from("games")
          .select("id, status, match_data, archived_at");
        if (fetchError) throw fetchError;

        const now = new Date();
        const threeDaysAgoISO = new Date(
          now.getTime() - 3 * 24 * 60 * 60 * 1000
        ).toISOString();

        const toArchive = (allGames || []).filter(
          (g) => g.status !== "archived" && gameAllResolved(g.match_data)
        );

        if (toArchive.length) {
          const { error: archErr } = await supabase
            .from("games")
            .update({
              status: "archived",
              archived_at: new Date().toISOString(),
            })
            .in(
              "id",
              toArchive.map((g) => g.id)
            );
          if (archErr) throw archErr;
        }

        await supabase
          .from("games")
          .delete()
          .lt("archived_at", threeDaysAgoISO)
          .eq("status", "archived");

        fetchGames();
      } catch (error) {
        console.error("Cleanup error:", error.message);
        showToast("Cleanup failed: " + error.message, "error");
      }
    };
    cleanupLifecycle();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select(
          `
          *,
          purchases(count)
        `
        )
        .neq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGames(data || []);
      showToast(`${data?.length || 0} games loaded ✅`, "success");
    } catch (err) {
      console.error(err.message);
      showToast("Failed to load games.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const needle = searchTerm.toLowerCase();
    return [game.booking_code, game.team_a, game.team_b, game.status]
      .filter(Boolean)
      .some((f) => f.toLowerCase().includes(needle));
  });

  if (!isClient)
    return (
      <div className="min-h-screen bg-[#142B6F]/5 p-6">
        <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#142B6F]/5 p-6">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-[#142B6F]">
            Game Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage and monitor all uploaded betting games
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#FFD601] focus:ring-2 focus:ring-[#FFD601]/30 outline-none transition-all duration-300 bg-white shadow-sm text-gray-800"
            />
          </div>
        </div>

        <motion.section
          id="game-form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-gray-200 shadow-sm"
        >
          <GameForm onGameAdded={fetchGames} showToast={showToast} />
        </motion.section>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
          <span>
            Showing {filteredGames.length} of {games.length} games
          </span>

          {isLoading && (
            <div className="flex items-center space-x-2 text-[#142B6F]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#142B6F] border-t-transparent"></div>
              <span>Loading games...</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-56 bg-gray-100 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-lg font-medium mb-1">
              {searchTerm ? "No games found" : "No games available"}
            </h3>
            <p className="text-sm">
              {searchTerm
                ? `No results for "${searchTerm}". Try another term.`
                : "Add your first game using the form above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onStatusChange={fetchGames}
                onDelete={fetchGames}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
