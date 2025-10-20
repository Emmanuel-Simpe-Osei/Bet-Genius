"use client";
import useLoading from "@/hooks/useLoading";
import { safeSupabaseQuery } from "@/lib/apiHelpers";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data?.session?.user) {
        await handleRedirect(data.session.user);
      } else {
        setAuthLoading(false);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleRedirect(session.user);
        } else {
          setAuthLoading(false);
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ Handle redirect based on role
  const handleRedirect = async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setError("Failed to fetch user role.");
        setAuthLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 500));

      if (profile?.role === "admin") {
        router.replace("/dashboard", { scroll: false });
      } else {
        router.replace("/user-dashboard", { scroll: false });
      }
    } catch (err) {
      setError("Something went wrong while redirecting.");
      setAuthLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

      if (signInError) throw new Error(signInError.message);

      if (data?.user) {
        await new Promise((r) => setTimeout(r, 800));
        await handleRedirect(data.user);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ✅ Keep consistent render tree
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002583] via-[#1a3a9c] to-[#FFB800] flex items-center justify-center p-4">
      {authLoading ? (
        // 🔄 Placeholder shown while checking session
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-lg font-medium"
        >
          Checking session...
        </motion.div>
      ) : (
        // 🎨 Actual login form
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-md"
        >
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Welcome Back!
          </h1>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/20 border border-red-500/30 text-white px-4 py-3 rounded-xl mb-6 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg">
                ✉️
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg">
                🔒
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#002583] to-[#FFB800] text-white font-bold py-4 px-6 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Signing In...
                </>
              ) : (
                "Sign In →"
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-white/60 text-sm">New here?</p>
            <Link
              href="/signup"
              className="text-[#FFB800] font-semibold hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
