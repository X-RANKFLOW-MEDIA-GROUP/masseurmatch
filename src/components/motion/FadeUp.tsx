"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type FadeUpProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  /** Optional Tailwind / CSS classes forwarded to the wrapper element */
  className?: string;
};

export default function FadeUp({ children, delay = 0, y = 24, className }: FadeUpProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
