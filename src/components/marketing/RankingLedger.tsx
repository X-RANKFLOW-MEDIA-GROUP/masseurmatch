"use client";

import { motion, useReducedMotion } from "framer-motion";

import { STRENGTH_SIGNALS } from "@/lib/ranking-signals";

/**
 * Illustrative profile-strength weighting. These signals do not set a
 * profile's position in results — they are the quality factors that turn a
 * listing view into a booking. Bars grow into view (respecting reduced-motion).
 */
export function RankingLedger() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-10 border-t-2 border-[#111111]">
      {STRENGTH_SIGNALS.map((signal, i) => (
        <div
          key={signal.key}
          className="grid grid-cols-[1.5fr_3fr_3rem] items-center gap-4 border-b border-[#E8E8E8] py-4 sm:grid-cols-[2.6fr_5fr_4rem] sm:gap-5"
        >
          <div className="text-[15px] font-semibold text-[#111111] sm:text-[17px]">
            {signal.label}
          </div>
          <div
            className="h-[11px] overflow-hidden rounded-full bg-[#EFEFEF]"
            role="img"
            aria-label={`${signal.label}: relative weight ${signal.weight} percent`}
          >
            <motion.span
              className="block h-full rounded-full bg-[var(--color-primary)]"
              initial={reduce ? false : { width: 0 }}
              whileInView={{ width: `${signal.weight}%` }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, delay: i * 0.07, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </div>
          <div className="text-right font-mono text-[15px] font-semibold tabular-nums text-[#111111] sm:text-base">
            {signal.weight}
          </div>
        </div>
      ))}
    </div>
  );
}
