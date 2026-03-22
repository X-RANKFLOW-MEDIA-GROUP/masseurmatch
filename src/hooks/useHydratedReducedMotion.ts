"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Keep the first client render aligned with the server to avoid hydration mismatches.
  return hasHydrated ? Boolean(prefersReducedMotion) : false;
}
