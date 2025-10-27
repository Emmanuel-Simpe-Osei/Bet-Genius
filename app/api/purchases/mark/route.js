// app/api/purchases/mark/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { user_id, game_id } = await req.json();

  // ✅ Mark as purchased
  const { data, error } = await supabase
    .from("purchases")
    .upsert([{ user_id, game_id, is_purchased: true }], {
      onConflict: ["user_id", "game_id"],
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}
