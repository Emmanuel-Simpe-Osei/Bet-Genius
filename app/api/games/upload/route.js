import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

//
// 🟢 CREATE A NEW GAME (Admin Upload)
//
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

//
// 🟡 FETCH ALL GAMES (with purchase info)
//
export async function GET() {
  try {
    // 1️⃣ Get all games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (gamesError) {
      console.error("❌ Failed to fetch games:", gamesError.message);
      return NextResponse.json({ error: gamesError.message }, { status: 500 });
    }

    // 2️⃣ Get all purchased games from purchases table
    const { data: purchases, error: purchaseError } = await supabase
      .from("purchases")
      .select("game_id");

    if (purchaseError) {
      console.error("❌ Purchase fetch error:", purchaseError.message);
      return NextResponse.json(
        { error: purchaseError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Extract purchased game IDs
    const purchasedIds = new Set(purchases.map((p) => p.game_id));

    // 4️⃣ Merge purchase info into each game
    const gamesWithPurchaseFlag = games.map((g) => ({
      ...g,
      purchased: purchasedIds.has(g.id),
    }));

    // 5️⃣ Return the updated games list
    return NextResponse.json({ success: true, data: gamesWithPurchaseFlag });
  } catch (err) {
    console.error("🚨 GET /games error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
