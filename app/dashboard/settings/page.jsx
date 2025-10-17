"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ old: "", new: "" });

  // Load admins and users
  useEffect(() => {
    const fetchData = async () => {
      const { data: adminsData } = await supabase.from("admins").select("*");
      const { data: usersData } = await supabase.from("users").select("*");
      setAdmins(adminsData || []);
      setUsers(usersData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 🟡 Change admin password
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

  // 🟢 Add new admin
  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password)
      return alert("Enter admin email and password");

    const { error } = await supabase
      .from("admins")
      .insert([{ email: newAdmin.email, password: newAdmin.password }]);

    if (error) {
      alert("❌ Failed to add admin: " + error.message);
    } else {
      alert("✅ New admin added!");
      setAdmins([...admins, newAdmin]);
      setNewAdmin({ email: "", password: "" });
    }
  };

  // 🟢 Add user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email)
      return alert("Please enter user details");

    const { error } = await supabase
      .from("users")
      .insert([{ name: newUser.name, email: newUser.email }]);

    if (error) {
      alert("❌ Failed to add user: " + error.message);
    } else {
      alert("✅ User added successfully!");
      setUsers([...users, newUser]);
      setNewUser({ name: "", email: "" });
    }
  };

  // 🔴 Delete user
  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      alert("❌ Failed to delete user: " + error.message);
    } else {
      alert("🗑 User deleted successfully!");
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#142B6F] text-white">
        <div className="animate-spin h-8 w-8 border-4 border-[#FFD601] border-t-transparent rounded-full"></div>
      </div>
    );

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
        <p className="text-white/70 mt-1">Manage your account and users</p>
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

      {/* Add Admin */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1B308D] p-6 rounded-2xl border border-[#FFD601]/30 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-[#FFD601] mb-4">
          👑 Add Admin
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="Admin Email"
            value={newAdmin.email}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, email: e.target.value })
            }
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={newAdmin.password}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, password: e.target.value })
            }
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <button
            onClick={handleAddAdmin}
            className="bg-[#FFD601] text-[#142B6F] font-semibold rounded-lg px-4 py-2 hover:bg-yellow-400 transition"
          >
            Add Admin
          </button>
        </div>
      </motion.div>

      {/* Add User */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1B308D] p-6 rounded-2xl border border-[#FFD601]/30 shadow-lg"
      >
        <h2 className="text-xl font-semibold text-[#FFD601] mb-4">
          👤 Add User
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-300 text-black"
          />
          <button
            onClick={handleAddUser}
            className="bg-[#FFD601] text-[#142B6F] font-semibold rounded-lg px-4 py-2 hover:bg-yellow-400 transition"
          >
            Add User
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

        {users.length === 0 ? (
          <p className="text-white/70">No users available.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center bg-[#142B6F]/60 p-3 rounded-lg border border-[#FFD601]/10"
              >
                <div>
                  <p className="font-semibold">{u.name}</p>
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
