"use client";

import { Users, MapPin, Sparkles, BadgeDollarSign } from "lucide-react";
import Counter from "@/components/motion/Counter";
import FadeUp from "@/components/motion/FadeUp";

const STATS = [
  { value: 500, suffix: "+", label: "Professional profiles", icon: Users },
  { value: 80, suffix: "+", label: "US cities", icon: MapPin },
  { value: 1200, suffix: "+", label: "Services listed", icon: Sparkles },
  { value: 100, suffix: "%", label: "Free to browse", icon: BadgeDollarSign },
] as const;

export function StatsBand() {
  return (
    <section className="border-y border-border/60 bg-card py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <FadeUp>
          <div className="grid grid-cols-2 divide-x divide-border/60 lg:grid-cols-4">
            {STATS.map(({ value, suffix, label, icon: Icon }) => (
              <div key={label} className="px-6 py-2 first:pl-0 last:pr-0 lg:px-10">
                <Icon className="mb-3 h-5 w-5 text-primary" strokeWidth={2} />
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
