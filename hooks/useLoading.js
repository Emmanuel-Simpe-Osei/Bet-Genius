// hooks/useLoading.js
import { useState, useCallback } from "react";

/**
 * ⏳ Reusable hook to track async loading states
 */
export default function useLoading() {
  const [loading, setLoading] = useState(false);

  const wrapAsync = useCallback(async (fn) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, wrapAsync };
}
