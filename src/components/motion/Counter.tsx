"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

type CounterProps = {
  to: number;
  suffix?: string;
  duration?: number;
};

export default function Counter({ to, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    let controls: ReturnType<typeof animate> | null = null;

    if (inView) {
      controls = animate(motionVal, to, {
        duration,
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
    }

    return () => {
      if (controls) controls.stop();
    };
  }, [inView, to, duration, motionVal]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display.toLocaleString()} {suffix}
    </span>
  );
}
