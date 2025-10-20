"use client";

import { usePathname } from "next/navigation";
import ClientNavbarWrapper from "./ClientNavbarWrapper";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Hide navbar only on admin and user dashboards
  const hideNavbar =
    pathname.startsWith("/dashboard") || pathname.startsWith("/user-dashboard");

  return (
    <>
      {!hideNavbar && <ClientNavbarWrapper />}
      {children}
    </>
  );
}
