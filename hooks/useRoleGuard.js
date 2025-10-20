"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * ✅ Fixed: useRoleGuard()
 * - Avoids redirect loops during hydration
 * - Keeps hook order stable
 * - Works for both admin & user dashboards
 */
export function useRoleGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        // 🚫 If not logged in
        if (error || !data?.session?.user) {
          console.warn("🚫 No session found → redirecting to /login");
          router.push("/login");
          return;
        }

        // ✅ Logged-in user → check role
        const { data: profile, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (roleError || !profile) {
          console.error("❌ Role fetch error or missing profile");
          router.push("/login");
          return;
        }

        const role = profile.role || "user";

        // 🧭 Prevent role mismatch navigation
        if (pathname.startsWith("/dashboard") && role !== "admin") {
          console.log("Redirecting non-admin to /user-dashboard");
          router.replace("/user-dashboard");
        } else if (pathname.startsWith("/user-dashboard") && role === "admin") {
          console.log("Redirecting admin to /dashboard");
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("❌ Auth error:", err.message);
        router.push("/login");
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);
}
