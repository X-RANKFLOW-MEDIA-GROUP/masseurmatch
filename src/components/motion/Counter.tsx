"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate, useReducedMotion } from "framer-motion";

type CounterProps = {
  to: number;
  suffix?: string;
  duration?: number;
};

export default function Counter({ to, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const motionVal = useMotionValue(0);
  const isDecimal = to % 1 !== 0;
  const [display, setDisplay] = useState<string>(isDecimal ? "0.0" : "0");
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const format = (v: number) =>
      isDecimal ? v.toFixed(1) : Math.round(v).toLocaleString();

    if (prefersReducedMotion) {
      setDisplay(format(to));
      return;
    }

    let controls: ReturnType<typeof animate> | null = null;

    if (inView) {
      controls = animate(motionVal, to, {
        duration,
        onUpdate: (v) => setDisplay(format(v)),
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
