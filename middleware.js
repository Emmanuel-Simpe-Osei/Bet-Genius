// middleware.js
import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // 🚫 Skip middleware for non-protected or external routes
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon") ||
    path.startsWith("/images") ||
    path.startsWith("/public") ||
    path.includes("supabase.co") ||
    path.includes("storage/v1")
  ) {
    return res;
  }

  // 🟢 Allow login/signup freely
  if (path === "/login" || path === "/signup") return res;

  // 🧠 Get Supabase session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log("🧩 Middleware Trigger:", {
    path,
    hasSession: !!session,
    error: error?.message,
  });

  // ⏳ Let through if cookie not set yet
  if (!session && req.cookies.get("sb-access-token") === undefined) {
    console.log("⏳ Cookie not yet available, skipping redirect");
    return res;
  }

  // 🚫 Redirect unauthenticated dashboard users
  if (
    !session &&
    (path.startsWith("/dashboard") || path.startsWith("/user-dashboard"))
  ) {
    console.log("🚫 No session found → redirect to /login");
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ Role-based redirection between dashboards
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const role = profile?.role || "user";

    // Admin visiting user dashboard → send to admin dashboard
    if (role === "admin" && path.startsWith("/user-dashboard")) {
      console.log("🔄 Admin detected → redirecting to /dashboard");
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // User visiting admin dashboard → send to user dashboard
    if (role !== "admin" && path.startsWith("/dashboard")) {
      console.log("🔄 Normal user detected → redirecting to /user-dashboard");
      url.pathname = "/user-dashboard";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

// ✅ Apply middleware only to dashboard routes
export const config = {
  matcher: ["/dashboard/:path*", "/user-dashboard/:path*"],
};
