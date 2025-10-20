"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * A universal hook that protects any page from being accessed
 * when the user is not logged in or the session is missing.
 * Redirects automatically to /login.
 */
export function useSafeAuthGuard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        // 🚫 No session or Supabase auth error (like AuthSessionMissingError)
        if (error || !data?.session?.user) {
          console.warn("🚫 No valid session found:", error?.message);
          router.replace("/login");
          return;
        }

        // ✅ Session exists
        setLoading(false);
      } catch (err) {
        console.error("❌ Auth guard caught error:", err.message);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return { loading };
}
