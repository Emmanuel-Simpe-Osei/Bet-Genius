"use client";

import "../styles/globals.css";
import NavbarClient from "@/components/NavbarClient";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // ✅ Hide global navbar on dashboards
  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/user-dashboard");

  return (
    <html lang="en">
      <body>
        {/* ✅ Only show on public pages */}
        {!hideNavbar && <NavbarClient />}
        {children}
      </body>
    </html>
  );
}
