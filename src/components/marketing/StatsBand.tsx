"use client";

import Counter from "@/components/motion/Counter";

const STATS = [
  { value: 500, suffix: "+", label: "Verified therapist profiles" },
  { value: 80, suffix: "+", label: "US cities with live pages" },
  { value: 1200, suffix: "+", label: "Service routes indexed" },
  { value: 4.9, suffix: "★", label: "Average therapist rating" },
] as const;

export function StatsBand() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-16">
          {STATS.map(({ value, suffix, label }) => (
            <div key={label}>
              <div className="font-display font-extrabold text-[clamp(3rem,8vw,6rem)] leading-none tracking-[-0.03em]">
                <Counter to={value} suffix={suffix} />
              </div>
              <p className="mt-3 text-base text-muted-foreground lg:text-lg">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
