"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users from Supabase (adjust table name to match your DB)
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#142B6F] p-6 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-[#FFD601]">Registered Users</h1>
        <p className="text-white/70 mt-2">View all platform users</p>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-64"
        >
          <div className="animate-spin h-8 w-8 border-4 border-[#FFD601] border-t-transparent rounded-full"></div>
        </motion.div>
      ) : users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/80 py-20"
        >
          <p className="text-6xl mb-3">👤</p>
          <h2 className="text-lg font-medium">No users found yet</h2>
          <p className="text-sm text-white/60">
            Once users register, they’ll appear here.
          </p>
        </motion.div>
      ) : (
        /* ✅ User Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user, i) => (
            <motion.div
              key={user.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="rounded-2xl shadow-lg p-5 border border-[#FFD601]/30 bg-[#1B308D] hover:shadow-[#FFD601]/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#142B6F]"
                  style={{ backgroundColor: "#FFD601" }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-xs text-white/60">
                  ID: {user.id || "—"}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#FFD601] mb-1">
                  {user.name || "Unknown User"}
                </h3>
                <p className="text-sm text-white/80">
                  {user.email || "No email provided"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
