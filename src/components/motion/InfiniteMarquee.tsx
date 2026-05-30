"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type InfiniteMarqueeProps = {
  items: string[];
  separator?: string;
  speed?: number; // seconds
  className?: string;
};

export default function InfiniteMarquee({
  items,
  separator = "✦",
  speed = 30,
  className = "",
}: InfiniteMarqueeProps) {
  const reduce = useReducedMotion();

  const renderItems = (list: string[]) => (
    <div className="flex items-center space-x-6">
      {list.map((it, i) => (
        <span key={`${it}-${i}`} className="whitespace-nowrap">
          {it}
          {i < list.length - 1 ? ` ${separator} ` : ""}
        </span>
      ))}
    </div>
  );

  if (reduce) {
    return <div className={className}>{renderItems(items)}</div>;
  }

  // Duplicate items for seamless loop
  const duplicated = [...items, ...items];

  return (
    <div className={`overflow-hidden w-full ${className}`}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {renderItems(duplicated)}
      </motion.div>
    </div>
  );
}
