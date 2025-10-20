import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("🧱 Received upload payload:", body);

    const { data, error } = await supabase
      .from("games")
      .insert([body])
      .select("*");

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Game inserted successfully:", data);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("🚨 API route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
