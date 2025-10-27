import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔗 Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

//
// 🟢 RECORD A NEW PURCHASE
//
export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, game_id } = body;

    if (!user_id || !game_id) {
      return NextResponse.json(
        { error: "Missing user_id or game_id." },
        { status: 400 }
      );
    }

    // ✅ Check if already purchased (prevent duplicates)
    const { data: existing, error: checkError } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user_id)
      .eq("game_id", game_id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing)
      return NextResponse.json(
        { success: true, message: "Already purchased." },
        { status: 200 }
      );

    // ✅ Insert new purchase
    const { data, error } = await supabase
      .from("purchases")
      .insert([{ user_id, game_id }])
      .select("*")
      .single();

    if (error) throw error;

    console.log("💰 Purchase recorded:", data);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("🚨 Purchase API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

//
// 🟡 GET ALL PURCHASES (optional for admin debugging)
//
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, user_id, game_id, created_at");

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("🚨 GET /purchases error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
