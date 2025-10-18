import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * 🔐 BetGenius Middleware
 * - Protects routes based on user role
 * - Redirects unauthorized visitors
 * - Works for both admin and user dashboards
 */
export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Get the active session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Public routes (don’t block these)
  const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return res;
  }

  // 🔒 If no session, redirect to login
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Fetch the user's role from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const role = profile?.role || "user";

  // 🔄 Route protection logic
  if (pathname.startsWith("/dashboard") && role !== "admin") {
    // If a normal user tries to open the admin dashboard
    const userUrl = req.nextUrl.clone();
    userUrl.pathname = "/user-dashboard";
    return NextResponse.redirect(userUrl);
  }

  if (pathname.startsWith("/user-dashboard") && role === "admin") {
    // If an admin tries to open the user dashboard
    const adminUrl = req.nextUrl.clone();
    adminUrl.pathname = "/dashboard";
    return NextResponse.redirect(adminUrl);
  }

  // ✅ Otherwise allow access
  return res;
}

/**
 * Define which routes middleware runs on
 * You can adjust these if needed
 */
export const config = {
  matcher: ["/dashboard/:path*", "/user-dashboard/:path*"],
};
