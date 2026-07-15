import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { City } from "@/data/provider-cities";

type FinalCTAProps = {
  city: City;
  /** Fully-built signup CTA URL (includes ?city=…&utm_*). */
  profileHref: string;
};

/**
 * Closing call-to-action. City name is interpolated; no results are promised.
 */
export function FinalCTA({ city, profileHref }: FinalCTAProps) {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-background">
      <div className="page-shell pb-24 pt-4 sm:pb-28">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-accent px-8 py-14 text-center sm:px-12 sm:py-16">
          {/* Restrained single-color glow. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, rgb(255 255 255 / 0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2
              id="final-cta-heading"
              className="text-2xl font-bold tracking-tight text-white sm:text-[2rem]"
            >
              Ready to Create Your Professional Profile?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Start your 14-day free trial and build your presence in the{" "}
              {city.name} directory.
            </p>
            <Link
              href={profileHref}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-accent shadow-sm transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Start Your Free Trial
              <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <p className="mt-4 text-sm text-white/70">No credit card required.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
