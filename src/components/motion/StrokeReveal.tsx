"use client";

import { motion, useReducedMotion } from "framer-motion";

type StrokeRevealProps = {
  d: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  className?: string;
  viewBox?: string;
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StrokeReveal({
  d,
  width = 200,
  height = 60,
  strokeColor = "#CC2424",
  strokeWidth = 2,
  duration = 1.2,
  delay = 0,
  className = "",
  viewBox,
}: StrokeRevealProps) {
  const reduced = useReducedMotion();

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox ?? `0 0 ${width} ${height}`}
      fill="none"
      className={`${className}`}
      aria-hidden="true"
    >
      <motion.path
        d={d}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: reduced ? 0 : duration, ease, delay: reduced ? 0 : delay }}
      />
    </svg>
  );
}
