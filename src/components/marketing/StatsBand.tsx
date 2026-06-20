"use client";

import { Diamond, CheckCircle, UserCheck, Smile, TrendingUp, Users, Award, LayoutGrid } from "lucide-react";
import Counter from "@/components/motion/Counter";
import FadeUp from "@/components/motion/FadeUp";

const FEATURES = [
  { icon: Diamond, label: "Features guarantee" },
  { icon: CheckCircle, label: "For specialized technique" },
  { icon: UserCheck, label: "Professional profilers" },
  { icon: Smile, label: "100% hospitable and human" },
] as const;

const STATS = [
  { icon: TrendingUp, value: 0, suffix: "", label: "Statistics" },
  { icon: Users, value: 45000, suffix: "", label: "45,000 mass allowvers" },
  { icon: Award, value: 2300, suffix: "+", label: "2,300+ verified trackers" },
  { icon: LayoutGrid, value: 23, suffix: "+", label: "23+ masseur decks" },
] as const;

export function StatsBand() {
  return (
    <section className="bg-[#F5F5F5] py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        <FadeUp>
          {/* Row 1: Features */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 mb-12">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border border-[#E5E5E5] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2.25} />
                </div>
                <p className="text-sm text-[#1A1A1A] font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Row 2: Stats */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map(({ icon: Icon, value, suffix, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border border-[#E5E5E5] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2.25} />
                </div>
                {value > 0 ? (
                  <div className="font-display font-extrabold text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-tight text-[#1A1A1A] mb-1">
                    <Counter to={value} suffix={suffix} />
                  </div>
                ) : null}
                <p className="text-sm text-gray-600">
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
