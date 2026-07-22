"use client";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

type BreathingGlowProps = {
  color?: string;
  size?: number;
  duration?: number;
  className?: string;
};

export function BreathingGlow({
  color = "rgba(139, 30, 45, 0.15)",
  size = 400,
  duration = 5,
  className = "",
}: BreathingGlowProps) {
  const reduced = useHydratedReducedMotion();

  if (reduced) return null;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full mm-breathing-glow ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        "--glow-duration": `${duration}s`,
      } as React.CSSProperties}
    />
  );
}
