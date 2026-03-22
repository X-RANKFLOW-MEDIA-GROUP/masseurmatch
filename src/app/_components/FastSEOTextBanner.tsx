"use client";

import { motion } from "framer-motion";

const KEYWORDS = [
  "PREMIUM MEN'S MASSAGE",
  "GAY-FRIENDLY THERAPISTS",
  "DEEP TISSUE & RECOVERY",
  "INCLUSIVE WELLNESS SPA",
  "LGBTQ+ HOLISTIC CARE",
  "SPORTS MASSAGE EXPERTS",
] as const;

const LOOP_ITEMS = [...KEYWORDS, ...KEYWORDS];

export default function FastSEOTextBanner() {
  return (
    <div
      className="relative flex overflow-hidden whitespace-nowrap bg-slate-950 py-5 sm:py-6"
      aria-label="Popular wellness search categories"
    >
      <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent" />

      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="flex min-w-max items-center gap-8 sm:gap-12 pr-8 sm:pr-12"
      >
        {LOOP_ITEMS.map((word, index) => (
          <div key={`${word}-${index}`} className="flex items-center gap-8 sm:gap-12">
            <span className="font-display text-2xl font-medium tracking-[-0.04em] text-slate-200 sm:text-3xl">
              {word}
            </span>
            <span className="h-2 w-2 rounded-full bg-sky-400/60" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
