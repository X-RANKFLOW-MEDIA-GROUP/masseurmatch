"use client";

import Counter from "@/components/motion/Counter";
import FadeUp from "@/components/motion/FadeUp";

const STATS = [
  { value: 500, suffix: "+", label: "Professional profiles" },
  { value: 80, suffix: "+", label: "US cities" },
  { value: 1200, suffix: "+", label: "Services listed" },
  { value: 100, suffix: "%", label: "Licensed & screened" },
] as const;

export function StatsBand() {
  return (
    <section className="border-y border-border/40 py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <FadeUp>
          <div className="grid grid-cols-2 divide-x divide-border/40 lg:grid-cols-4">
            {STATS.map(({ value, suffix, label }, i) => (
              <div
                key={label}
                className="px-6 py-2 first:pl-0 last:pr-0 lg:px-10"
              >
                <div className="font-display font-extrabold text-[clamp(2.25rem,5vw,4rem)] leading-none tracking-[-0.03em] text-foreground">
                  <Counter to={value} suffix={suffix} />
                </div>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
