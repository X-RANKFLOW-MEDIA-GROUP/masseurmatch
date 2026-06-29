"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type TextShimmerProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
};

export function TextShimmer({
  children,
  className = "",
  duration = 3,
  delay = 0,
}: TextShimmerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className={`mm-text-shimmer ${className}`}
      style={{
        "--shimmer-duration": `${duration}s`,
        "--shimmer-delay": `${delay}s`,
      } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
