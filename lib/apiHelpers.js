// lib/apiHelpers.js

/**
 * 🌀 Fetch helper with retry and timeout (for slow or unstable networks)
 */
export async function fetchWithRetry(
  url,
  options = {},
  retries = 3,
  timeout = 10000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt)); // wait before retry
    }
  }
}

/**
 * 🌐 Safe Supabase query wrapper to handle offline mode and network issues
 */
export async function safeSupabaseQuery(queryFn) {
  try {
    if (!navigator.onLine) {
      throw new Error("You are offline. Check your internet connection.");
    }

    const { data, error } = await queryFn();
    if (error) throw error;

    return data;
  } catch (err) {
    console.error("Supabase Query Error:", err.message);
    throw err;
  }
}
