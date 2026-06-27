"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type InkRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  origin?: "center" | "left" | "right" | "bottom";
};

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const clipPaths = {
  center: {
    hidden: "inset(45% 45% 45% 45% round 50%)",
    visible: "inset(0% 0% 0% 0% round 0%)",
  },
  left: {
    hidden: "inset(0% 100% 0% 0%)",
    visible: "inset(0% 0% 0% 0%)",
  },
  right: {
    hidden: "inset(0% 0% 0% 100%)",
    visible: "inset(0% 0% 0% 0%)",
  },
  bottom: {
    hidden: "inset(100% 0% 0% 0%)",
    visible: "inset(0% 0% 0% 0%)",
  },
};

export function InkReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  origin = "center",
}: InkRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const paths = clipPaths[origin];

  return (
    <motion.div
      className={className}
      initial={{ clipPath: paths.hidden, opacity: 0 }}
      whileInView={{ clipPath: paths.visible, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
