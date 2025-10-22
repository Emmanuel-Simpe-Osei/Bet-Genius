"use client";

import "../styles/globals.css";
import NavbarClient from "@/components/NavbarClient";
import NetworkHandler from "@/components/NetworkHandler"; // ✅ NEW IMPORT
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// ⚙️ Optional custom loading animation
function GlobalLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#142B6F]/10 text-[#142B6F]">
      <div className="animate-spin h-10 w-10 border-4 border-[#FFD601] border-t-transparent rounded-full mb-3"></div>
      <p className="text-sm font-medium">Loading, please wait...</p>
    </div>
  );
}

// ⚡ Optional inline network strength indicator (for hydration)
function NetworkIndicator() {
  const [status, setStatus] = useState("online");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const updateStatus = () =>
      setStatus(navigator.onLine ? "online" : "offline");
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    if (navigator.connection) {
      const checkSpeed = () => {
        const conn = navigator.connection;
        setSlow(
          conn.effectiveType.includes("2g") ||
            conn.effectiveType.includes("slow-2g")
        );
      };
      checkSpeed();
      navigator.connection.addEventListener("change", checkSpeed);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      navigator.connection?.removeEventListener("change", () => {});
    };
  }, []);

  if (status === "offline" || slow) {
    return (
      <div className="fixed top-0 left-0 w-full bg-yellow-400 text-[#142B6F] text-center py-2 z-50 text-sm font-medium shadow-md">
        ⚠️{" "}
        {status === "offline"
          ? "You’re offline"
          : "Slow network detected — performance may be limited."}
      </div>
    );
  }

  return null;
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Delay render until hydration completes
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Hide navbar on dashboards
  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/user-dashboard");

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#142B6F]">
        {/* Global network status banner */}
        <NetworkHandler /> {/* ✅ Always active in the whole app */}
        {/* Inline indicator during hydration */}
        <NetworkIndicator />
        {/* Show loading spinner before full hydration */}
        {!ready ? (
          <GlobalLoader />
        ) : (
          <>
            {!hideNavbar && <NavbarClient />}
            <main>{children}</main>
          </>
        )}
      </body>
    </html>
  );
}
