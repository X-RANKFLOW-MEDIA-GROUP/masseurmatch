import Link from "next/link";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import type { City } from "@/data/provider-cities";

type CityHeroProps = {
  city: City;
  /** Fully-built signup CTA URL (includes ?city=…&utm_*). */
  profileHref: string;
  /** Anchor target for the secondary "how it works" button. */
  howItWorksHref?: string;
};

/**
 * Hero band for the provider landing page. Fully dynamic — every city string is
 * interpolated from `city`, nothing is hard-coded.
 */
export function CityHero({ city, profileHref, howItWorksHref = "#how-it-works" }: CityHeroProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Restrained radial dot grid + soft glow, per brand effects guidance. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(17 17 17 / 0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
        }}
      />
      <div className="page-shell relative py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            <ShieldCheck className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            {city.state} · {city.stateCode}
          </span>

          <h1 className="mt-6 text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.5rem]">
            Get Listed in the Massage Directory for{" "}
            <span className="text-accent">{city.name}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Create a professional profile and make it easier for clients in{" "}
            {city.name}, {city.stateCode} to discover your massage and bodywork
            services.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-lg font-semibold text-foreground">
              Start your 14-day free trial
            </p>
            <p className="text-sm text-muted-foreground">No credit card required.</p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={profileHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#6E1521] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 sm:w-auto"
            >
              Create Your Profile
              <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <Link
              href={howItWorksHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-[#F7F7F7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 sm:w-auto"
            >
              <PlayCircle className="size-5" strokeWidth={2.25} aria-hidden="true" />
              Learn How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
