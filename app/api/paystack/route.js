import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🧾 VERIFY PAYSTACK TRANSACTION + RECORD PURCHASE
export async function POST(req) {
  try {
    const { reference, user_id, game_id } = await req.json();

    if (!reference || !user_id || !game_id) {
      return NextResponse.json(
        { error: "Missing required fields: reference, user_id, or game_id." },
        { status: 400 }
      );
    }

    // ✅ Step 1: Verify transaction with Paystack API
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    // ✅ Step 2: Check if this purchase already exists
    const { data: existing } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user_id)
      .eq("game_id", game_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Purchase already recorded.",
      });
    }

    // ✅ Step 3: Record new purchase
    const { data, error } = await supabase
      .from("purchases")
      .insert([{ user_id, game_id }])
      .select("*")
      .single();

    if (error) throw error;

    console.log("💰 Purchase recorded successfully:", data);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("🚨 Paystack verification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
