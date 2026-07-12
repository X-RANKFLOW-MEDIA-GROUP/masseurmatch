"use client";

import { useMemo, useState } from "react";
import { Check, Lock } from "lucide-react";

import { MAX_SCORE, RANKING_SIGNALS } from "@/lib/ranking-signals";

function verdict(score: number): { lead: string; rest: string } {
  if (score === 0)
    return { lead: "Empty profile.", rest: " You will not appear in search results at all." };
  if (score < 40)
    return {
      lead: "Below the fold.",
      rest: " Clients are searching your city right now and they are not scrolling this far down your tier.",
    };
  if (score < 70)
    return {
      lead: "Mid-tier.",
      rest: " You are visible within your placement tier. You are not the first name a client calls.",
    };
  if (score < MAX_SCORE)
    return {
      lead: "Top of your tier.",
      rest: " This is where the calls happen — earned, not bought.",
    };
  return {
    lead: "Maximum score.",
    rest: " Reached without spending a dollar on your score, which is the entire point.",
  };
}

export function RankingSimulator() {
  const [on, setOn] = useState<Record<string, boolean>>({});

  const score = useMemo(
    () => RANKING_SIGNALS.reduce((sum, s) => sum + (on[s.key] ? s.weight : 0), 0),
    [on],
  );
  const v = verdict(score);

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
      {/* Toggles */}
      <div>
        <div className="flex flex-col gap-0.5">
          {RANKING_SIGNALS.map((s) => {
            const pressed = Boolean(on[s.key]);
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => setOn((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                className={`flex w-full items-center gap-3.5 border px-4 py-3.5 text-left text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                  pressed
                    ? "border-[var(--color-primary)] bg-[#F8EDEE]"
                    : "border-[#E8E8E8] bg-white hover:border-[var(--color-primary)]"
                }`}
              >
                <span
                  className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[3px] border transition-colors ${
                    pressed
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : "border-[#8E8E8E] bg-white"
                  }`}
                >
                  <Check
                    size={11}
                    strokeWidth={3}
                    className={`text-white transition-opacity ${pressed ? "opacity-100" : "opacity-0"}`}
                  />
                </span>
                <span className="flex-1 font-medium text-[#111111]">{s.label}</span>
                <span className="font-mono text-[13px] tabular-nums text-[#6F6F6F]">
                  {s.weight} pts
                </span>
              </button>
            );
          })}
        </div>

        {/* The locked row — honest: plan buys reach, not score. */}
        <button
          type="button"
          aria-disabled="true"
          tabIndex={-1}
          className="mt-0.5 flex w-full cursor-not-allowed items-center gap-3.5 border border-dashed border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3.5 text-left"
        >
          <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[3px] border border-[#D9D9D9] bg-[#EFEFEF]">
            <Lock size={10} strokeWidth={2.5} className="text-[#8E8E8E]" />
          </span>
          <span className="flex-1 font-medium text-[#8E8E8E]">Pay to raise your score</span>
          <span className="font-mono text-[13px] tabular-nums text-[#8E8E8E]">0 pts</span>
        </button>
        <p className="max-w-[46ch] px-4 pt-2.5 font-mono text-[12px] leading-relaxed text-[#6F6F6F]">
          There is no switch here to turn on. Your plan sets your visibility tier — how widely your
          score is shown — but inside that tier, these six earned signals are the only thing that
          ranks you, and none of them can be bought.
        </p>
      </div>

      {/* Score card */}
      <aside
        className="sticky top-24 h-fit border-2 border-[#111111] bg-white p-6"
        aria-live="polite"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6F6F]">
          Profile score
        </div>
        <div className="my-1.5 font-display text-[76px] font-extrabold leading-none tracking-tight tabular-nums text-[#111111]">
          {score}
        </div>
        <div className="font-mono text-[13px] text-[#6F6F6F]">out of {MAX_SCORE}</div>
        <div className="my-5 h-2 overflow-hidden rounded-full bg-[#EFEFEF]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300 ease-out"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="min-h-[3em] text-[14px] leading-relaxed text-[#6F6F6F]">
          <b className="font-semibold text-[#111111]">{v.lead}</b>
          {v.rest}
        </p>
      </aside>
    </div>
  );
}
