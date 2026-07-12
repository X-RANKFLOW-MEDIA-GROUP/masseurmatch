"use client";

import { motion, useReducedMotion } from "framer-motion";

import { RANKING_SIGNALS } from "@/lib/ranking-signals";

/**
 * The ledger is the thesis: six earned signals sum to a score out of 100,
 * and a final dashed "zero" row makes the point that price adds nothing to it.
 * Bars grow into view (respecting reduced-motion).
 */
export function RankingLedger() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-12 border-t-2 border-[#111111]">
      {RANKING_SIGNALS.map((signal, i) => (
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
            {signal.weight}%
          </div>
        </div>
      ))}

      {/* The zero row carries the whole argument — honestly scoped to the score. */}
      <div className="mt-0.5 grid grid-cols-[1.5fr_3fr_3rem] items-center gap-4 border-b-2 border-[#111111] py-5 sm:grid-cols-[2.6fr_5fr_4rem] sm:gap-5">
        <div className="text-[15px] font-semibold text-[#111111] sm:text-[17px]">
          What you pay us
          <span className="mt-1 block text-[13px] font-normal text-[#6F6F6F]">
            Standard, Pro or Elite — same score function
          </span>
        </div>
        <div className="h-px border-t border-dashed border-[#B8B8B8]" aria-hidden="true" />
        <div className="text-right font-mono text-[15px] font-semibold tabular-nums text-[#8E8E8E] sm:text-base">
          0%
        </div>
      </div>
    </div>
  );
}
