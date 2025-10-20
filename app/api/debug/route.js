import { NextResponse } from "next/server";

export async function GET() {
  console.log("✅ /api/debug route is working!");
  return NextResponse.json({
    message: "✅ Next.js API routes are working fine!",
    env: {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "✅ Found"
        : "❌ Missing",
      SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "✅ Found"
        : "❌ Missing",
    },
  });
}
