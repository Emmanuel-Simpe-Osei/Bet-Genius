"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Validate form
  const validateForm = () => {
    if (!formData.name.trim())
      return setError("Please enter your full name"), false;
    if (!/^[0-9]{9,15}$/.test(formData.phone))
      return setError("Enter a valid phone number (digits only)"), false;
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords don't match"), false;
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters"), false;
    if (!formData.agreeToTerms)
      return setError("Please accept the terms and conditions"), false;
    return true;
  };

  // ✅ Handle signup
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 🟢 Step 1: Sign up user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (error) throw error;
      const user = data?.user;

      // 🟢 Step 2: Create or update profile record manually
      if (user) {
        // Check if profile already exists (avoid duplicates)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: formData.email,
                full_name: formData.name,
                phone: formData.phone,
                role: "user",
              },
            ]);
          if (insertError) {
            console.error("❌ Profile insert error:", insertError);
          } else {
            console.log("✅ Profile inserted successfully for:", formData.name);
          }
        } else {
          console.log("ℹ️ Profile already exists — skipping insert.");
        }
      }

      // 🟢 Step 3: Store name for later welcome toast
      sessionStorage.setItem("welcomeName", formData.name);

      // 🟢 Step 4: Success animation & redirect
      setSuccess(true);
      setTimeout(() => router.push("/predictions"), 2500);
    } catch (err) {
      console.error("🔥 Sign-up error:", err.message);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  // ✅ Success Animation
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002583] via-[#1a3a9c] to-[#FFB800] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-3"
          >
            Welcome Aboard, {formData.name.split(" ")[0]}! 🎉
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 mb-8 text-lg"
          >
            Redirecting you to predictions...
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2 }}
            className="h-1 bg-[#FFB800] rounded-full origin-left mx-auto w-full"
          />
        </motion.div>
      </div>
    );
  }

  // ✅ Main Signup Form (same UI)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002583] via-[#1a3a9c] to-[#FFB800] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#002583] to-[#FFB800] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Us</h1>
          <p className="text-white/70">Create your account and get started</p>
        </div>

        {/* Error Message */}
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

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-5">
          {[
            {
              name: "name",
              type: "text",
              placeholder: "Full Name",
              icon: "👤",
            },
            {
              name: "phone",
              type: "tel",
              placeholder: "Phone Number",
              icon: "📞",
            },
            {
              name: "email",
              type: "email",
              placeholder: "Email Address",
              icon: "✉️",
            },
            {
              name: "password",
              type: "password",
              placeholder: "Password",
              icon: "🔒",
            },
            {
              name: "confirmPassword",
              type: "password",
              placeholder: "Confirm Password",
              icon: "🔒",
            },
          ].map((field) => (
            <div key={field.name} className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-lg">
                {field.icon}
              </div>
              <input
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
          ))}

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-2xl border border-white/10">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-5 h-5 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-[#FFB800]"
            />
            <label className="text-white/80 text-sm leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-[#FFB800] font-semibold underline"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#FFB800] font-semibold underline"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !formData.agreeToTerms}
            className="w-full bg-gradient-to-r from-[#002583] to-[#FFB800] text-white font-bold py-4 px-6 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? "Creating Account..." : "Get Started →"}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">Already have an account?</p>
          <Link
            href="/login"
            className="text-[#FFB800] font-semibold hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
