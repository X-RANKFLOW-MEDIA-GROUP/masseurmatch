import Image from "next/image";
import FadeUp from "@/components/motion/FadeUp";

const TRUST_POINTS = [
  "Multi-step identity & credential review",
  "Photo quality check before publishing",
  "No anonymous or unverified listings",
  "Real client reviews, never incentivised",
];

export function WhyUsSplit() {
  return (
    <section className="py-16 lg:py-24">

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left — cinematic image with overlaid stat */}
          <FadeUp delay={0.05}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#0a1628]">
              <Image
                src="/marketing/hero/cover.jpg"
                alt="Verified massage therapy session"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent" />

              {/* Overlaid stat */}
              <div className="absolute bottom-8 left-8">
                <p className="font-display text-[5.5rem] font-extrabold leading-none tracking-tight text-white lg:text-[7rem]">
                  98<span className="text-primary">%</span>
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-white/70">
                  Profiles verified before going live
                </p>
              </div>

              {/* Top badge */}
              <div className="absolute right-5 top-5 rounded-full glass-dark px-3 py-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                  MasseurMatch Standard
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Right — content */}
          <FadeUp delay={0.12}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Why MasseurMatch
              </p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
                Built different from legacy directories.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground max-w-md">
                MasseurMatch focuses on safety, trust, and inclusivity. Every profile
                passes a multi-step review before going live — no anonymous listings,
                no unverified claims.
              </p>

              <ul className="mt-8 space-y-3">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>

              {/* Rating stat */}
              <div className="mt-10 inline-flex items-baseline gap-3 border-t border-border/40 pt-8">
                <p className="font-display text-[4rem] font-extrabold leading-none tracking-tight">
                  4.9<span className="text-primary">★</span>
                </p>
                <div>
                  <p className="text-sm font-semibold">Average therapist rating</p>
                  <p className="text-xs text-muted-foreground">Across all verified profiles</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
