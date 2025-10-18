// app/layout.jsx
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Script from "next/script"; // ✅ Import Next.js script component

export const metadata = {
  title: "BetGenius",
  description: "Smart Betting Predictions – Free, VIP & Correct Score Tips",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Use Next.js <Script> for Paystack */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive" // loads only on client side
        />
      </head>

      <body className="bg-[#0E1D59] text-white">
        {/* ✅ Navbar globally fixed */}
        <Navbar />

        {/* ✅ Page content area (padding prevents overlap) */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
