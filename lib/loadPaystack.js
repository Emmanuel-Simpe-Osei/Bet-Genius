// lib/loadPaystack.js
export async function loadPaystack() {
  // If already loaded, just return it
  if (typeof window !== "undefined" && window.PaystackPop) {
    return window.PaystackPop;
  }

  // Otherwise, dynamically load the script
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("No window");

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject("Paystack failed to initialize");
    };

    script.onerror = () => reject("Paystack script failed to load");
    document.body.appendChild(script);
  });
}
