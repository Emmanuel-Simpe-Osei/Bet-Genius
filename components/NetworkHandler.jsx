"use client";
import { useEffect, useState } from "react";

export default function NetworkHandler() {
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
      <div className="fixed bottom-0 left-0 w-full bg-yellow-400 text-[#142B6F] text-center py-2 z-50 text-sm font-semibold shadow-md">
        ⚠️{" "}
        {status === "offline"
          ? "You’re currently offline. Some features may not work."
          : "Slow connection detected — please wait..."}
      </div>
    );
  }
  return null;
}
