import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // ✅ Check if user exists
    const { data: user, error: findError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .single();

    if (findError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Promote to admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `✅ ${email} promoted to admin successfully!`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
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
