"use client";

import { Diamond, CheckCircle, UserCheck, Smile, MapPin, Layers, ShieldCheck, Wallet } from "lucide-react";
import FadeUp from "@/components/motion/FadeUp";

const FEATURES = [
  { icon: Diamond, label: "Premium profiles" },
  { icon: CheckCircle, label: "Identity verified" },
  { icon: UserCheck, label: "LGBTQ+ affirming" },
  { icon: Smile, label: "Direct contact" },
] as const;

// Honest, non-numeric value statements — no fabricated counts pre-launch.
const STATS = [
  { icon: MapPin, headline: "Nationwide", label: "City pages across the US" },
  { icon: Layers, headline: "Specialized", label: "Deep tissue, Swedish, sports & more" },
  { icon: ShieldCheck, headline: "Reviewed", label: "Every profile before it goes live" },
  { icon: Wallet, headline: "Transparent", label: "Direct contact, no booking fees" },
] as const;

export function StatsBand() {
  return (
    <section className="bg-[#F7F7F7] py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4">
        <FadeUp>
          {/* Row 1: Features */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 mb-12">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border border-[#E8E8E8] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#111111]" strokeWidth={2.25} />
                </div>
                <p className="text-sm text-[#111111] font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Row 2: Honest value statements (non-numeric) */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map(({ icon: Icon, headline, label }) => (
              <div key={headline} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border border-[#E8E8E8] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#111111]" strokeWidth={2.25} />
                </div>
                <div className="font-display font-extrabold text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-tight text-[#111111] mb-1">
                  {headline}
                </div>
                <p className="text-sm text-[#6F6F6F]">
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
