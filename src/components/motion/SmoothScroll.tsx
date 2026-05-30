"use client";

import React, { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

type SmoothScrollProps = {
  children: React.ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return; // disable on mobile

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      try {
        lenis.destroy();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return <>{children}</>;
}
