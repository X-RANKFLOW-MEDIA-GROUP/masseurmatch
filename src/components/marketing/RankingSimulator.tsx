"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { MAX_STRENGTH, STRENGTH_SIGNALS } from "@/lib/ranking-signals";

function verdict(score: number): { lead: string; rest: string } {
  if (score === 0)
    return {
      lead: "Bare profile.",
      rest: " A client who lands here has no reason to choose you over the next listing.",
    };
  if (score < 40)
    return {
      lead: "Thin.",
      rest: " You show up, but there is not enough here to turn a curious visitor into a message.",
    };
  if (score < 70)
    return {
      lead: "Credible.",
      rest: " A client can picture the session. You are in the running — not yet the obvious call.",
    };
  if (score < MAX_STRENGTH)
    return {
      lead: "Strong.",
      rest: " Most clients who open this profile have what they need to reach out. This is where the messages happen.",
    };
  return {
    lead: "Complete.",
    rest: " Nothing left for a client to wonder about — every one of these was earned, not paid for.",
  };
}

export function RankingSimulator() {
  const [on, setOn] = useState<Record<string, boolean>>({});

  const score = useMemo(
    () => STRENGTH_SIGNALS.reduce((sum, s) => sum + (on[s.key] ? s.weight : 0), 0),
    [on],
  );
  const v = verdict(score);

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
      {/* Toggles */}
      <div>
        <div className="flex flex-col gap-0.5">
          {STRENGTH_SIGNALS.map((s) => {
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
        <p className="max-w-[48ch] px-4 pt-3 font-mono text-[12px] leading-relaxed text-[#6F6F6F]">
          Every one of these is free and fully in your hands. None of them costs an upgrade — a plan
          changes where you appear in results, not whether your profile earns the click once a client
          is looking at it.
        </p>
      </div>

      {/* Strength card */}
      <aside
        className="sticky top-24 h-fit border-2 border-[#111111] bg-white p-6"
        aria-live="polite"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F6F6F]">
          Profile strength
        </div>
        <div className="my-1.5 font-display text-[76px] font-extrabold leading-none tracking-tight tabular-nums text-[#111111]">
          {score}
        </div>
        <div className="font-mono text-[13px] text-[#6F6F6F]">out of {MAX_STRENGTH}</div>
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
