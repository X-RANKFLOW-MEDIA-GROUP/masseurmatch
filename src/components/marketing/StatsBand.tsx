"use client";

import { Diamond, CheckCircle, UserCheck, Smile, TrendingUp, Users, Award, LayoutGrid } from "lucide-react";
import Counter from "@/components/motion/Counter";
import { InkReveal } from "@/components/motion/InkReveal";
import { StaggerReveal } from "@/components/motion/StaggerReveal";

const FEATURES = [
  { icon: Diamond, label: "Premium profiles" },
  { icon: CheckCircle, label: "Identity verified" },
  { icon: UserCheck, label: "LGBTQ+ affirming" },
  { icon: Smile, label: "Direct contact" },
] as const;

const STATS = [
  { icon: TrendingUp, value: 250, suffix: "+", label: "US cities covered" },
  { icon: Users, value: 48, suffix: "+", label: "States with listings" },
  { icon: Award, value: 6, suffix: "", label: "Massage specialties" },
  { icon: LayoutGrid, value: 10, suffix: "+", label: "Verified therapist listings" },
] as const;

export function StatsBand() {
  return (
    <section className="bg-[#F7F7F7] py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Row 1: Features */}
        <StaggerReveal
          className="grid grid-cols-2 gap-8 lg:grid-cols-4 mb-12"
          stagger={0.08}
          blur
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <InkReveal origin="center" duration={0.7}>
                <div className="w-12 h-12 rounded-full border border-[#E8E8E8] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#111111]" strokeWidth={2.25} />
                </div>
              </InkReveal>
              <p className="text-sm text-[#111111] font-medium">
                {label}
              </p>
            </div>
          ))}
        </StaggerReveal>

        {/* Row 2: Stats */}
        <StaggerReveal
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
          stagger={0.1}
          blur
        >
          {STATS.map(({ icon: Icon, value, suffix, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <InkReveal origin="center" duration={0.7}>
                <div className="w-12 h-12 rounded-full border border-[#E8E8E8] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#111111]" strokeWidth={2.25} />
                </div>
              </InkReveal>
              <div className="font-display font-extrabold text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-tight text-[#111111] mb-1">
                <Counter to={value} suffix={suffix} />
              </div>
              <p className="text-sm text-[#6F6F6F]">
                {label}
              </p>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
