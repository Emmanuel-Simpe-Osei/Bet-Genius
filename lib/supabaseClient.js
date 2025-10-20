// lib/supabaseClient.js

import { createClient } from "@supabase/supabase-js";
import { safeSupabaseQuery } from "./apiHelpers"; // ✅ import our helper

// ✅ Environment variables (public keys only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 🧠 Optional: Safe wrapper for Supabase queries
 * Use this helper instead of calling supabase.from() directly
 */
export async function querySafe(fn) {
  return await safeSupabaseQuery(fn);
}
