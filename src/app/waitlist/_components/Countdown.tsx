"use client";

import { useEffect, useState } from "react";

// July 7 2026 06:00 UTC = midnight CDT (Dallas)
const LAUNCH = new Date("2026-07-07T06:00:00Z");

type R = { days: number; hours: number; mins: number; secs: number };

function remaining(): R {
  const diff = Math.max(0, LAUNCH.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
    secs: Math.floor((diff % 60_000) / 1_000),
  };
}

export function Countdown() {
  const [r, setR] = useState<R | null>(null);

  useEffect(() => {
    setR(remaining());
    const id = setInterval(() => setR(remaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!r) return null;

  const units = [
    { label: "Days", v: r.days },
    { label: "Hrs", v: r.hours },
    { label: "Min", v: r.mins },
    { label: "Sec", v: r.secs },
  ];

  return (
    <div className="flex items-end gap-1.5 sm:gap-3" aria-label="Countdown to launch">
      {units.map(({ label, v }, i) => (
        <div key={label} className="flex items-end gap-1.5 sm:gap-3">
          {i > 0 && (
            <span className="mb-2.5 text-lg font-light text-white/20 sm:text-2xl" aria-hidden>:</span>
          )}
          <div className="flex flex-col items-center">
            <div className="min-w-[3rem] rounded-xl bg-white/[0.06] px-2 py-1.5 text-center sm:min-w-[4rem] sm:py-2">
              <span className="font-display block text-2xl font-extrabold tabular-nums text-white sm:text-3xl md:text-4xl">
                {String(v).padStart(2, "0")}
              </span>
            </div>
            <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
