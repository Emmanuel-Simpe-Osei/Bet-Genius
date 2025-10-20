"use client";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

// ✅ Safe Paystack Loader
async function loadPaystack() {
  if (
    typeof window !== "undefined" &&
    window.PaystackPop &&
    typeof window.PaystackPop.setup === "function"
  ) {
    console.log("✅ Paystack already loaded");
    return window.PaystackPop;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      if (
        window.PaystackPop &&
        typeof window.PaystackPop.setup === "function"
      ) {
        console.log("✅ Paystack script initialized successfully");
        resolve(window.PaystackPop);
      } else {
        reject("⚠️ Paystack failed to initialize properly.");
      }
    };

    script.onerror = () => reject("❌ Failed to load Paystack script.");
    document.body.appendChild(script);
  });
}

export default function PredictionCard({ game, user, onShowModal }) {
  // ------------------------------------------
  // 🧠 Local component states
  // ------------------------------------------
  const [revealed, setRevealed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [owned, setOwned] = useState(false);

  // ------------------------------------------
  // ⚙️ Normalize game type (friendly display)
  // ------------------------------------------
  const gameType = game.game_type?.toLowerCase();
  const isFree = gameType === "free";
  const isVip = gameType === "vip" || gameType === "custom vip";
  const isCorrectScore =
    gameType === "correct score" || gameType === "custom correct score";
  const isCustom =
    gameType === "custom vip" || gameType === "custom correct score";
  const isRecovery = gameType === "recovery";

  const displayType = isVip
    ? "VIP"
    : isCorrectScore
    ? "Correct Score"
    : isRecovery
    ? "Recovery"
    : "Free";

  // ------------------------------------------
  // 🔍 Check if user already purchased
  // ------------------------------------------
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .maybeSingle();
      if (data) {
        setOwned(true);
        setRevealed(true);
      }
    };
    checkOwnership();
  }, [user, game.id]);

  // ------------------------------------------
  // ⚡ Prepare matches safely
  // ------------------------------------------
  const matches = useMemo(
    () => (Array.isArray(game.match_data) ? game.match_data : []),
    [game.match_data]
  );

  // ------------------------------------------
  // 📋 Copy booking code
  // ------------------------------------------
  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    onShowModal?.("📋 Booking code copied — bet responsibly & good luck!");
  };

  // ------------------------------------------
  // 💳 Paystack Payment Handler
  // ------------------------------------------
  const handlePurchase = async () => {
    if (!user) return (window.location.href = "/login");
    if (owned) return setRevealed(true);

    // ❌ Handle custom types — slot full
    if (isCustom) {
      return onShowModal?.(
        "⚠️ Slot Full — Please wait for the next game drop!"
      );
    }

    // ❌ Handle recovery type — restricted
    if (isRecovery) {
      return onShowModal?.(
        "🔄 Recovery Game — Only available to users who lost a previous match."
      );
    }

    try {
      setProcessing(true);
      console.log("🚀 Starting Paystack flow...");

      const PaystackPop = await loadPaystack();

      if (!PaystackPop || typeof PaystackPop.setup !== "function") {
        throw new Error("Paystack not fully initialized — please refresh.");
      }

      // ✅ Payment Success Handler
      const handlePaymentSuccess = (response) => {
        console.log("✅ Paystack payment callback triggered:", response);
        paystackCallback(response);
      };

      const paystackCallback = async (response) => {
        try {
          const { error } = await supabase.from("orders").insert({
            user_id: user.id,
            game_id: game.id,
            amount: game.price || 0,
            currency: "GHS",
            status: "paid",
            paystack_ref: response.reference,
          });

          if (error) throw error;
          setOwned(true);
          setRevealed(true);
          onShowModal?.("✅ Payment successful! Your code is now unlocked.");
        } catch (err) {
          console.error("Insert error:", err);
          onShowModal?.(
            "⚠️ Payment saved but could not verify. Please contact support."
          );
        }
      };

      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: (game.price || 0) * 100,
        currency: "GHS",
        callback: (resp) => handlePaymentSuccess(resp),
        onClose: () =>
          onShowModal?.("💳 Payment window closed. You can try again anytime."),
      });

      handler.openIframe();
    } catch (err) {
      console.error("💥 Paystack setup error:", err);
      onShowModal?.("❌ Payment failed. Please refresh and retry.");
    } finally {
      setProcessing(false);
    }
  };

  // ------------------------------------------
  // 🖼️ UI Layout
  // ------------------------------------------
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:scale-[1.02] transition-all"
    >
      {/* 🏷 Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-[#FFD601] capitalize">{displayType}</h3>
        <p className="text-xs text-white/70">
          {new Date(game.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* 🎯 Odds & Price */}
      <div className="flex justify-between text-sm mb-4">
        <p>Total Odds: {game.total_odds}</p>
        <p>₵{game.price || 0}</p>
      </div>

      {/* 🏆 Matches */}
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
                m.status === "Win"
                  ? "text-emerald-400"
                  : m.status === "Loss"
                  ? "text-red-400"
                  : "text-yellow-400"
              }
            >
              {m.status || "Pending"}
            </span>
          </div>
        ))}
      </div>

      {/* 🎫 Booking Code */}
      <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
        <span className="text-white/80">Booking:</span>
        {isFree || revealed ? (
          <button
            onClick={() => copyCode(game.booking_code)}
            className="bg-[#FFD601] text-[#142B6F] px-4 py-1 rounded-lg font-bold"
          >
            {game.booking_code}
          </button>
        ) : (
          <span className="blur-sm select-none">XXXXXX 🔒</span>
        )}
      </div>

      {/* 🔓 Footer */}
      {isFree ? (
        <p className="text-emerald-400 text-sm mt-3 text-center">
          🎉 Free Tip — Copy & Bet Smart!
        </p>
      ) : revealed ? (
        <p className="text-[#FFD601] text-sm mt-3 text-center">
          ✅ Purchased — Revealed in Orders
        </p>
      ) : isRecovery ? (
        <p className="text-[#FFB800] text-sm mt-3 text-center">
          🔄 Recovery Game — Only available to previous buyers
        </p>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={processing}
          className="w-full mt-3 bg-[#FFD601] text-[#142B6F] font-bold py-2 rounded-xl hover:brightness-110 transition-all"
        >
          {processing ? "Processing…" : `Unlock for ₵${game.price}`}
        </button>
      )}
    </motion.div>
  );
}
