// lib/paystackLoader.js
export async function loadPaystack() {
  if (typeof window === "undefined") throw new Error("window not available");

  // If Paystack already loaded
  if (window.PaystackPop && typeof window.PaystackPop.setup === "function") {
    return window.PaystackPop;
  }

  // Otherwise, dynamically inject
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      if (
        window.PaystackPop &&
        typeof window.PaystackPop.setup === "function"
      ) {
        resolve(window.PaystackPop);
      } else {
        reject("⚠️ Paystack loaded but setup() not ready.");
      }
    };
    script.onerror = () => reject("❌ Failed to load Paystack.");
    document.body.appendChild(script);
  });
}
