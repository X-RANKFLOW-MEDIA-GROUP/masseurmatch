"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

type MagneticHoverProps = {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
  as?: "div" | "span" | "button";
};

export function MagneticHover({
  children,
  strength = 0.35,
  radius = 200,
  className,
  as = "div",
}: MagneticHoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    const pull = 1 - dist / radius;
    x.set(dx * strength * pull);
    y.set(dy * strength * pull);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </Component>
  );
}
