"use client";

import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cn } from "@/lib/utils";

type TextRevealProps = {
  text: string;
  delay?: number;
  className?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function TextReveal({ text, delay = 0, className }: TextRevealProps) {
  const reduceMotion = useHydratedReducedMotion();
  const words = text.split(" ");
  const wrapperClassName = cn("inline-flex flex-wrap", className);

  if (reduceMotion) {
    return <span className={wrapperClassName}>{text}</span>;
  }

  return (
    <span className={wrapperClassName} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="overflow-hidden">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ opacity: 0, y: "0.9em", filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: delay + index * 0.045,
              duration: 0.6,
              ease: EASE,
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
