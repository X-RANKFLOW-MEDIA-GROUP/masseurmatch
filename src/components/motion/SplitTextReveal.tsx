"use client";

import { motion, useReducedMotion } from "framer-motion";

type SplitTextRevealProps = {
  text: string;
  className?: string;
  charDelay?: number;
  wordMode?: boolean;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
};

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SplitTextReveal({
  text,
  className = "",
  charDelay = 0.03,
  wordMode = false,
  tag: Tag = "span",
}: SplitTextRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const units = wordMode ? text.split(" ") : text.split("");

  return (
    <Tag className={className} aria-label={text}>
      {units.map((unit, i) => (
        <motion.span
          key={`${unit}-${i}`}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease, delay: i * charDelay }}
        >
          {unit}
          {wordMode && i < units.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
