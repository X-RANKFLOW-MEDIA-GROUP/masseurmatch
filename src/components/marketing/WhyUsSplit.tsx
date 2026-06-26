import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import FadeUp from "@/components/motion/FadeUp";

const TRUST_POINTS = [
  "Multi-step identity & profile review",
  "Photo quality check before publishing",
  "No anonymous or unverified listings",
  "Client reviews from documented contacts",
];

export function WhyUsSplit() {
  return (
    <section className="py-16 lg:py-24">

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left — cinematic image with overlaid stat */}
          <FadeUp delay={0.05}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#1A1A1A]">
              <Image
                src="/marketing/hero/cover.jpg"
                alt="Verified massage therapy session"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent" />

              {/* Overlaid statement */}
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-display text-[2.25rem] font-extrabold leading-[0.95] tracking-tight text-white lg:text-[3rem]">
                  Reviewed<span className="text-primary">.</span> Before it goes live<span className="text-primary">.</span>
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70">
                  Every single profile
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
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/80">{point}</span>
                  </li>
                ))}
              </ul>

              {/* Closing trust line */}
              <div className="mt-10 flex items-center gap-3 border-t border-border/40 pt-8">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Reviews from documented contacts</p>
                  <p className="text-xs text-muted-foreground">Only clients with a verified contact event can review</p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
