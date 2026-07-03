"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type StaggerRevealProps = {
  children: ReactNode[];
  className?: string;
  stagger?: number;
  direction?: "up" | "down" | "left" | "right";
  blur?: boolean;
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const directionOffset = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
};

export function StaggerReveal({
  children,
  className,
  stagger = 0.06,
  direction = "up",
  blur = true,
}: StaggerRevealProps) {
  const reduced = useReducedMotion();
  const offset = directionOffset[direction];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            x: offset.x,
            y: offset.y,
            filter: blur ? "blur(6px)" : "blur(0px)",
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
          }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease, delay: i * stagger }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
