// pages/GamesPage.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import GameForm from "./GameForm";
import GameCard from "./GameCard";
import { motion, AnimatePresence } from "framer-motion";

// 🎪 Custom Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-2xl shadow-lg border-l-4
        ${
          type === "success"
            ? "bg-green-50 border-green-500 text-green-800"
            : ""
        }
        ${type === "error" ? "bg-red-50 border-red-500 text-red-800" : ""}
        ${
          type === "warning"
            ? "bg-yellow-50 border-yellow-500 text-yellow-800"
            : ""
        }
        ${type === "info" ? "bg-blue-50 border-blue-500 text-blue-800" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{icons[type]}</span>
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

// 🔔 Custom Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 5000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toasts, showToast, removeToast } = useToast();
  const [isClient, setIsClient] = useState(false); // ✅ Add client check

  // ✅ Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 🎯 Fetch all games from Supabase with loading state
  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setGames(data || []);

      // 🎉 Show success toast only if we have games
      if (data && data.length > 0) {
        showToast(`🎮 Loaded ${data.length} games successfully!`, "success");
      }
    } catch (error) {
      console.error("❌ Error fetching games:", error.message);
      showToast("😞 Failed to load games. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Load games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  // 🔍 Filter games based on search term
  const filteredGames = games.filter(
    (game) =>
      game.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.game_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Don't render anything until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* 🎪 Custom Toast Container */}
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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* 🎯 Header Section
        <div className="text-center space-y-4 py-8">
          <motion.h1
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#002583] to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            🎮 Game Library
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Discover and manage your favorite games in one place
          </motion.p>
        </div> */}

        {/* 🔍 Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search games by booking code or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-2xl border border-gray-200 focus:border-[#002583] focus:ring-2 focus:ring-[#002583]/20 focus:outline-none transition-all duration-300 bg-white shadow-sm"
              // ✅ Remove any auto-complete attributes that might cause issues
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </motion.div>

        {/* 📝 Game Upload Form - PASS THE PROPS CORRECTLY */}
        <motion.section
          id="game-form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GameForm
            onGameAdded={fetchGames} // ✅ This refreshes the games list
            showToast={showToast} // ✅ This enables toast notifications
          />
        </motion.section>

        {/* 📊 Stats & Loading State */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              📊 Showing {filteredGames.length} of {games.length} games
            </span>
            {searchTerm && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                Searching: "{searchTerm}"
              </motion.span>
            )}
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-[#002583]"
            >
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#002583] border-t-transparent"></div>
              <span className="text-sm font-medium">Loading games...</span>
            </motion.div>
          )}
        </motion.div>

        {/* 🎮 Games Grid */}
        {isLoading ? (
          // 💫 Loading Skeleton
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 h-40 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : filteredGames.length === 0 ? (
          // 🎭 Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? "No games found" : "No games yet"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm
                ? `No games match your search for "${searchTerm}". Try different keywords.`
                : "Start by adding your first game using the form above!"}
            </p>
          </motion.div>
        ) : (
          // 🃏 Games Grid with animations
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onStatusChange={fetchGames} // ✅ Refresh after status change
                onDelete={fetchGames} // ✅ Refresh after delete
                showToast={showToast} // ✅ Enable toasts in GameCard
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
