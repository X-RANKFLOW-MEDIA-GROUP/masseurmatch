"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type FadeUpProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
};

export default function FadeUp({ children, delay = 0, y = 24 }: FadeUpProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
