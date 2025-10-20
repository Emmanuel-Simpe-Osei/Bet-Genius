"use client";

import "../../styles/globals.css"; // ✅ Correct path to your global styles
import NavbarClient from "@/components/NavbarClient";
import { usePathname } from "next/navigation"; // ✅ FIX: make sure this is imported

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // ✅ Hide global navbar on dashboards
  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/user-dashboard");

  return (
    <html lang="en">
      <body>
        {/* ✅ Only show the main navbar on public pages */}
        {!hideNavbar && <NavbarClient />}
        {children}
      </body>
    </html>
  );
}
