"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate, useReducedMotion } from "framer-motion";

type CounterProps = {
  to: number;
  suffix?: string;
  duration?: number;
};

function formatValue(v: number, isDecimal: boolean): string {
  // Fixed locale: this runs during SSR (Node, en-US) and again during client
  // hydration — a locale-dependent format would hydration-mismatch (#418) for
  // visitors whose browser locale groups digits differently.
  return isDecimal ? v.toFixed(1) : Math.round(v).toLocaleString("en-US");
}

export default function Counter({ to, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const motionVal = useMotionValue(0);
  const isDecimal = to % 1 !== 0;
  // SSR and initial client render show the real final value so crawlers index it.
  const [display, setDisplay] = useState<string>(formatValue(to, isDecimal));
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(formatValue(to, isDecimal));
      return;
    }

    let controls: ReturnType<typeof animate> | null = null;

    if (inView) {
      // Reset motion value to 0 then animate up — the initial SSR value gives
      // crawlers the real number; the animation is purely a visual enhancement.
      motionVal.set(0);
      controls = animate(motionVal, to, {
        duration,
        onUpdate: (v) => setDisplay(formatValue(v, isDecimal)),
      });
    }

    return () => {
      if (controls) controls.stop();
    };
  }, [inView, to, duration, motionVal, prefersReducedMotion, isDecimal]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}{suffix}
    </span>
  );
}
