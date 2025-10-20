"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import NavbarClient from "@/components/NavbarClient";

const brand = {
  primary: "#142B6F",
  accent: "#FFD601",
  panel: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.92)",
  textMuted: "rgba(255,255,255,0.7)",
};

export default function RecoveryPage() {
  const [user, setUser] = useState(null);
  const [eligibleSince, setEligibleSince] = useState(null); // Date when a loss occurred
  const [recoveryGames, setRecoveryGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  // ▶️ Soft auth guard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        window.location.href = "/login";
        return;
      }
      setUser(data.user);
    })();
  }, []);

  // ▶️ Determine eligibility (has an order with any match status = lost/loss)
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setEligibilityLoading(true);

        // 1) Pull user orders (recent first)
        const { data: orders, error: orderErr } = await supabase
          .from("orders")
          .select("id, game_id, created_at, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (orderErr) throw orderErr;
        if (!orders || orders.length === 0) {
          setEligibleSince(null);
          return;
        }

        // 2) Fetch all referenced games (to check match_data)
        const gameIds = Array.from(
          new Set(orders.map((o) => o.game_id))
        ).filter(Boolean);
        if (gameIds.length === 0) {
          setEligibleSince(null);
          return;
        }

        const { data: games, error: gamesErr } = await supabase
          .from("games")
          .select("id, match_data, created_at")
          .in("id", gameIds);

        if (gamesErr) throw gamesErr;

        // 3) Find the most recent order whose game had any lost match
        let foundLossDate = null;

        for (const order of orders) {
          const g = games.find((x) => x.id === order.game_id);
          const matches = Array.isArray(g?.match_data) ? g.match_data : [];
          const hasLoss = matches.some((m) => {
            const s = String(m?.status || "").toLowerCase();
            return s === "lost" || s === "loss";
          });
          if (hasLoss) {
            foundLossDate = new Date(order.created_at);
            break; // the first (most recent) in sorted list
          }
        }

        setEligibleSince(foundLossDate);
      } catch (e) {
        console.error("Eligibility check error:", e);
        setEligibleSince(null);
      } finally {
        setEligibilityLoading(false);
      }
    })();
  }, [user]);

  // ▶️ Fetch recovery games (after eligibility date)
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("games")
          .select("*")
          .eq("game_type", "recovery")
          .order("created_at", { ascending: false });

        // If the user is eligible from a certain date, prefer new drops after that date
        if (eligibleSince) {
          query = query.gte("created_at", eligibleSince.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;

        setRecoveryGames(data || []);
      } catch (e) {
        console.error("Fetch recovery games error:", e);
        setRecoveryGames([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, eligibleSince]);

  const eligible = !!eligibleSince;

  // Helpers
  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    alert("📋 Booking code copied — good luck!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E1D59] to-[#142B6F] text-white">
      <div className="pt-24 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pb-6 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-[#FFD601]">Recovery</span> Games
          </h1>
          <p className="text-white/80 mt-2 max-w-2xl mx-auto">
            Recovery tips are available only to users who purchased a game where
            at least one match
            <span className="text-[#FFD601]"> lost</span>. If you qualify, your
            recovery drops will appear here.
          </p>
        </motion.header>

        {/* Eligibility banner */}
        <AnimatePresence>
          {eligibilityLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-center text-white/80"
            >
              Checking eligibility…
            </motion.div>
          ) : eligible ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border px-4 py-3 text-sm"
              style={{ background: brand.panel, borderColor: brand.border }}
            >
              ✅ You’re eligible for recovery drops (since{" "}
              <span className="text-[#FFD601]">
                {eligibleSince?.toLocaleString()}
              </span>
              ).
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border px-4 py-3 text-sm"
              style={{ background: brand.panel, borderColor: brand.border }}
            >
              🔒 You’re not eligible for recovery yet. If one of your purchased
              games loses, you’ll unlock recovery tips here.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl h-56 animate-pulse"
              />
            ))}
          </div>
        ) : !eligible ? (
          <div className="text-center mt-16">
            <div className="text-5xl mb-3">🧾</div>
            <p className="text-white/80 mb-6">
              Make a purchase and if a match loses, your recovery will appear
              here.
            </p>
            <Link
              href="/predictions"
              className="inline-flex items-center px-5 py-3 rounded-xl font-semibold"
              style={{ background: brand.accent, color: brand.primary }}
            >
              Browse Games →
            </Link>
          </div>
        ) : recoveryGames.length === 0 ? (
          <div className="text-center mt-16">
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-white/80">
              No recovery drops yet. Check back soon.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
          >
            {recoveryGames.map((game) => (
              <RecoveryCard key={game.id} game={game} onCopy={copyCode} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function RecoveryCard({ game, onCopy }) {
  const matches = useMemo(
    () => (Array.isArray(game.match_data) ? game.match_data : []),
    [game.match_data]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/5 border border-white/10 p-5"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-[#FFD601]">Recovery</h3>
        <p className="text-xs text-white/70">
          {new Date(game.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Odds */}
      <div className="flex justify-between text-sm mb-4">
        <p>Total Odds: {game.total_odds}</p>
        <p className="text-white/70">₵{game.price || 0}</p>
      </div>

      {/* Matches */}
      <div className="bg-white/5 rounded-xl p-3 mb-4 max-h-36 overflow-y-auto text-sm text-white/80">
        {matches.map((m, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-white/10 py-1 last:border-none"
          >
            <span>
              {m.homeTeam} vs {m.awayTeam}
            </span>
            <span
              className={
                String(m.status || "").toLowerCase() === "win"
                  ? "text-emerald-400"
                  : String(m.status || "").toLowerCase() === "lost" ||
                    String(m.status || "").toLowerCase() === "loss"
                  ? "text-red-400"
                  : "text-yellow-400"
              }
            >
              {m.status || "Pending"}
            </span>
          </div>
        ))}
      </div>

      {/* Booking Code — always revealed on Recovery */}
      <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
        <span className="text-white/80">Booking:</span>
        <button
          onClick={() => onCopy(game.booking_code)}
          className="bg-[#FFD601] text-[#142B6F] px-4 py-1 rounded-lg font-bold"
        >
          {game.booking_code}
        </button>
      </div>

      <p className="text-[#FFD601] text-xs mt-3 text-center">
        🔄 Recovery drop — no purchase required.
      </p>
    </motion.div>
  );
}
