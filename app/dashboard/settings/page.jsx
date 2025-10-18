"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [passwords, setPasswords] = useState({ old: "", new: "" });

  // 🟢 Load all profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) console.error("Fetch profiles error:", error);
      setProfiles(data || []);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  // 🟡 Change current user password
  const handlePasswordChange = async () => {
    if (!passwords.old || !passwords.new)
      return alert("Please fill both fields");

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      alert("❌ Failed to update password: " + error.message);
    } else {
      alert("✅ Password updated successfully!");
      setPasswords({ old: "", new: "" });
    }
  };

  // 👑 Add Admin using new /api/admin/promote endpoint
  const handleAddAdmin = async () => {
    if (!newAdminEmail) return alert("Please enter an email address");

    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to promote user");
      }

      alert(`✅ ${newAdminEmail} has been promoted to admin!`);
      setNewAdminEmail("");

      // Refresh the list
      const { data: updatedProfiles } = await supabase
        .from("profiles")
        .select("*");
      setProfiles(updatedProfiles || []);
    } catch (err) {
      console.error("Add admin error:", err);
      alert("❌ Failed to add admin: " + err.message);
    }
  };

  // 🔴 Delete user
  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      alert("❌ Failed to delete user: " + error.message);
    } else {
      alert("🗑 User deleted successfully!");
      setProfiles(profiles.filter((u) => u.id !== id));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#142B6F] text-white">
        <div className="animate-spin h-8 w-8 border-4 border-[#FFD601] border-t-transparent rounded-full"></div>
      </div>
    );

  // 🖼️ UI Layout
  return (
    <div className="min-h-screen bg-[#142B6F] text-white p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-[#FFD601]">⚙️ Settings</h1>
        <p className="text-white/70 mt-1">Manage admins and users</p>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1B308D] p-6 rounded-2xl border border-[#FFD601]/30 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-[#FFD601] mb-4">
          🔐 Change Password
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="password"
            placeholder="Old Password"
            value={passwords.old}
            onChange={(e) =>
              setPasswords({ ...passwords, old: e.target.value })
            }
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <button
            onClick={handlePasswordChange}
            className="bg-[#FFD601] text-[#142B6F] font-semibold rounded-lg px-4 py-2 hover:bg-yellow-400 transition"
          >
            Update
          </button>
        </div>
      </motion.div>

      {/* Promote Admin */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1B308D] p-6 rounded-2xl border border-[#FFD601]/30 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-[#FFD601] mb-4">
          👑 Promote to Admin
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="User Email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <button
            onClick={handleAddAdmin}
            className="bg-[#FFD601] text-[#142B6F] font-semibold rounded-lg px-4 py-2 hover:bg-yellow-400 transition sm:col-span-2"
          >
            Promote to Admin
          </button>
        </div>
      </motion.div>

      {/* Manage Users */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1B308D] p-6 rounded-2xl border border-[#FFD601]/30 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-[#FFD601] mb-4">
          🗂 Manage Users
        </h2>

        {profiles.length === 0 ? (
          <p className="text-white/70">No users available.</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center bg-[#142B6F]/60 p-3 rounded-lg border border-[#FFD601]/10"
              >
                <div>
                  <p className="font-semibold">
                    {u.full_name || "No Name"}{" "}
                    {u.role === "admin" && (
                      <span className="text-[#FFD601] text-sm">(Admin)</span>
                    )}
                  </p>
                  <p className="text-sm text-white/70">{u.email}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="text-red-400 hover:text-red-500 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
