import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import FadeUp from "@/components/motion/FadeUp";

const OUR_FEATURES = [
  "Free to search & contact — no booking fees",
  "Direct therapist contact, no middleman",
  "Independent professionals own their profiles",
  "Identity-verified listings reviewed before going live",
  "Transparent pricing on every profile",
  "LGBTQ+-affirming therapists clearly marked",
  "Incall & outcall clearly indicated per listing",
  "AI match assistant to find the right fit fast",
];

const PLATFORM_FEATURES = [
  "Free to browse",
  "Commission-based: 20–30% per booking",
  "Platform controls the therapist relationship",
  "Variable verification standards across listings",
  "Rates set or influenced by platform",
  "Inclusion varies — not guaranteed",
  "Session type often unclear until checkout",
  "No guidance — you scroll and guess",
];

export function WhyMasseurMatch() {
  return (
    <section className="bg-[#060E1A] py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        <FadeUp>
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8B1E2D]">
              Why MasseurMatch
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-tight text-white">
              A directory, not a booking platform.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/50">
              Unlike on-demand massage apps that take commissions and control every booking,
              MasseurMatch connects you directly with independent therapists — and steps aside.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-12 grid grid-cols-1 gap-px bg-white/[0.06] sm:grid-cols-2">

            {/* MasseurMatch column */}
            <div className="bg-[#0B1829] p-8 lg:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#8B1E2D]">
                MasseurMatch
              </p>
              <p className="mt-1 text-xs text-white/35">Premium verified directory</p>
              <div className="mt-7 space-y-0 divide-y divide-white/[0.05]">
                {OUR_FEATURES.map((item) => (
                  <div key={item} className="flex items-start gap-3 py-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check size={11} className="text-emerald-400" strokeWidth={3} />
                    </div>
                    <span className="text-sm leading-5 text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generic platform column */}
            <div className="bg-[#080F1A] p-8 lg:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/30">
                On-demand platforms
              </p>
              <p className="mt-1 text-xs text-white/20">Booking apps &amp; commission services</p>
              <div className="mt-7 space-y-0 divide-y divide-white/[0.04]">
                {PLATFORM_FEATURES.map((item, i) => (
                  <div key={item} className="flex items-start gap-3 py-3 opacity-40">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                      {i === 0
                        ? <Check size={11} className="text-white/40" strokeWidth={3} />
                        : <X size={11} className="text-white/40" strokeWidth={3} />
                      }
                    </div>
                    <span className="text-sm leading-5 text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full bg-[#8B1E2D] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8B1E2D]/20 transition hover:bg-[#6E1521]"
            >
              Search therapists
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-7 py-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.09]"
            >
              See how it works
            </Link>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
