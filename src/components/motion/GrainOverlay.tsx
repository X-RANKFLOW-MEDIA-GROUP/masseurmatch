"use client";

import { useReducedMotion } from "framer-motion";

type GrainOverlayProps = {
  opacity?: number;
  className?: string;
};

export function GrainOverlay({ opacity = 0.035, className = "" }: GrainOverlayProps) {
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-[1] mm-grain ${className}`}
      style={{ opacity }}
    />
  );
}
