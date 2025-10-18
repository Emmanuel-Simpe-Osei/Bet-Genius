"use client";
/**
 * BetGenius — User Dashboard (App Router /user-dashboard)
 * - Animated sidebar tabs: Profile | Orders | Settings
 * - Fetches profile + orders from Supabase
 * - Update password via Supabase Auth
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// --- Theme ---
const brand = {
  primary: "#142B6F",
  accent: "#FFD601",
  panel: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.92)",
  textMuted: "rgba(255,255,255,0.7)",
};

// --- Micro components ---
function Badge({ children }) {
  return (
    <span
      className="px-2.5 py-1 text-xs rounded-full border"
      style={{
        borderColor: brand.border,
        background: "rgba(255,255,255,0.06)",
        color: brand.text,
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <div className="h-px w-full" style={{ background: brand.border }} />;
}

function TabPanel({ isActive, children }) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- MAIN DASHBOARD ---
export default function UserDashboardPage() {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  const tabs = useMemo(
    () => [
      { key: "profile", label: "Profile", icon: "👤" },
      { key: "orders", label: "Orders", icon: "🧾" },
      { key: "settings", label: "Settings", icon: "⚙️" },
    ],
    []
  );

  // --- Fetch user, profile, and orders ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setFetchError("");

        const { data: authData, error: authErr } =
          await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!authData?.user) {
          window.location.href = "/login";
          return;
        }
        setUser(authData.user);

        const { data: profileRows, error: profErr } = await supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url, created_at")

          .eq("id", authData.user.id)
          .maybeSingle();
        if (profErr) throw profErr;
        setProfile(profileRows);

        const { data: orderRows, error: orderErr } = await supabase
          .from("orders")
          .select("id, game_name, game_type, price, status, created_at")
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false });
        if (orderErr) throw orderErr;
        setOrders(orderRows || []);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        setFetchError(
          e?.message ||
            (typeof e === "object"
              ? JSON.stringify(e, null, 2)
              : "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- Password update handler ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setUpdateMsg("");
    if (!newPassword || newPassword.length < 6) {
      setUpdateMsg("Password should be at least 6 characters.");
      return;
    }
    try {
      setUpdating(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setUpdateMsg("✅ Password updated successfully.");
      setNewPassword("");
    } catch (e) {
      setUpdateMsg(`❌ ${e.message || "Could not update password."}`);
    } finally {
      setUpdating(false);
    }
  };

  // --- Loading / error ---
  if (loading) {
    return (
      <div
        className="min-h-[70vh] grid place-items-center"
        style={{ background: brand.primary, color: brand.text }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.8,
          }}
          className="px-5 py-3 rounded-xl text-sm"
          style={{
            background: brand.panel,
            border: `1px solid ${brand.border}`,
          }}
        >
          Loading your dashboard…
        </motion.div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div
        className="min-h-[70vh] grid place-items-center"
        style={{ background: brand.primary, color: brand.text }}
      >
        <div className="space-y-3 text-center">
          <p className="opacity-80">We couldn’t load your dashboard.</p>
          <p className="text-sm" style={{ color: brand.accent }}>
            {fetchError}
          </p>
          <Link href="/login" className="underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  // --- UI ---
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: brand.primary, color: brand.text }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              User Dashboard
            </h1>
            <p className="text-sm" style={{ color: brand.textMuted }}>
              Welcome back{profile?.name ? `, ${profile.name}` : ""}.
            </p>
          </div>

          <Link
            href="/purchase"
            className="px-4 py-2 rounded-xl font-medium"
            style={{ background: brand.accent, color: brand.primary }}
          >
            Purchase Games
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-6">
          {/* Sidebar */}
          <aside
            className="rounded-2xl p-3 md:p-4"
            style={{
              background: brand.panel,
              border: `1px solid ${brand.border}`,
            }}
          >
            <nav className="flex md:block gap-2 md:gap-0">
              {tabs.map((t) => {
                const isActive = tab === t.key;
                return (
                  <motion.button
                    key={t.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTab(t.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition ${
                      isActive ? "shadow-lg" : "hover:bg-white/5"
                    }`}
                    style={{
                      background: isActive ? brand.accent : "transparent",
                      color: isActive ? brand.primary : brand.text,
                      border: `1px solid ${brand.border}`,
                    }}
                  >
                    <span className="mr-2">{t.icon}</span>
                    {t.label}
                  </motion.button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <section className="space-y-6">
            {/* Profile */}
            <TabPanel isActive={tab === "profile"}>
              <div
                className="rounded-2xl p-5 md:p-6 space-y-5"
                style={{
                  background: brand.panel,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full grid place-items-center text-lg font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: `1px solid ${brand.border}`,
                    }}
                  >
                    {profile?.name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">Profile</h2>
                    <p className="text-sm" style={{ color: brand.textMuted }}>
                      Your account details at a glance
                    </p>
                  </div>
                </div>

                <Divider />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Full Name" value={profile?.name || "—"} />
                  <Field
                    label="Email"
                    value={profile?.email || user?.email || "—"}
                  />
                  <Field
                    label="Member Since"
                    value={
                      profile?.created_at
                        ? new Date(profile.created_at).toDateString()
                        : "—"
                    }
                  />
                  <Field
                    label="User ID"
                    value={profile?.id || user?.id || "—"}
                    copy
                  />
                </div>

                <div className="pt-4">
                  <p
                    className="text-sm mb-2"
                    style={{ color: brand.textMuted }}
                  >
                    Profile editing coming soon (avatar, name, etc.)
                  </p>
                  <Link href="/profile/edit" className="underline text-sm">
                    Go to profile editor
                  </Link>
                </div>
              </div>
            </TabPanel>

            {/* Orders */}
            <TabPanel isActive={tab === "orders"}>
              <div
                className="rounded-2xl p-5 md:p-6"
                style={{
                  background: brand.panel,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Orders</h2>
                  <Link href="/purchase" className="text-sm underline">
                    Buy a new game →
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <EmptyState
                    title="No orders yet"
                    subtitle="When you purchase a game, it will appear here."
                    cta={{ href: "/purchase", label: "Purchase Games" }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="text-left"
                          style={{ color: brand.textMuted }}
                        >
                          <th className="py-2 pr-3">Game</th>
                          <th className="py-2 pr-3">Type</th>
                          <th className="py-2 pr-3">Price</th>
                          <th className="py-2 pr-3">Status</th>
                          <th className="py-2 pr-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <motion.tr
                            key={o.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t"
                            style={{ borderColor: brand.border }}
                          >
                            <td className="py-3 pr-3 font-medium">
                              {o.game_name || "—"}
                            </td>
                            <td className="py-3 pr-3">
                              <Badge>{o.game_type || "—"}</Badge>
                            </td>
                            <td className="py-3 pr-3">
                              {typeof o.price === "number"
                                ? `₵${o.price.toFixed(2)}`
                                : "—"}
                            </td>
                            <td className="py-3 pr-3">
                              <span
                                className="text-xs px-2 py-1 rounded-lg"
                                style={{
                                  background:
                                    o.status === "Completed"
                                      ? "rgba(34,197,94,0.15)"
                                      : "rgba(234,179,8,0.15)",
                                  border: `1px solid ${brand.border}`,
                                }}
                              >
                                {o.status || "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-3">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleString()
                                : "—"}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabPanel>

            {/* Settings */}
            <TabPanel isActive={tab === "settings"}>
              <div
                className="rounded-2xl p-5 md:p-6 space-y-5"
                style={{
                  background: brand.panel,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <h2 className="text-xl font-semibold">Settings</h2>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <label className="block text-sm" htmlFor="password">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full px-4 py-2 rounded-xl outline-none"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${brand.border}`,
                      color: brand.text,
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 rounded-xl font-medium disabled:opacity-60"
                      style={{ background: brand.accent, color: brand.primary }}
                    >
                      {updating ? "Updating…" : "Update Password"}
                    </motion.button>
                    {updateMsg && (
                      <span
                        className="text-sm"
                        style={{ color: brand.textMuted }}
                      >
                        {updateMsg}
                      </span>
                    )}
                  </div>
                </form>

                <Divider />

                <div>
                  <p
                    className="text-sm mb-2"
                    style={{ color: brand.textMuted }}
                  >
                    Need to manage your account or email? Coming soon.
                  </p>
                </div>
              </div>
            </TabPanel>
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Reusable field component ---
function Field({ label, value, copy = false }) {
  return (
    <div className="space-y-1">
      <div
        className="text-xs uppercase tracking-wide"
        style={{ color: brand.textMuted }}
      >
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="px-3 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${brand.border}`,
          }}
        >
          {value}
        </div>
        {copy && (
          <button
            onClick={() => navigator.clipboard.writeText(String(value))}
            className="text-xs underline"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, cta }) {
  return (
    <div className="text-center py-16">
      <div className="text-2xl mb-2">{title}</div>
      <p className="text-sm mb-4" style={{ color: brand.textMuted }}>
        {subtitle}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="px-4 py-2 rounded-xl font-medium inline-block"
          style={{ background: brand.accent, color: brand.primary }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
