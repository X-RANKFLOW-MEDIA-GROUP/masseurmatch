import Image from "next/image";
import InfiniteMarquee from "@/components/motion/InfiniteMarquee";
import FadeUp from "@/components/motion/FadeUp";

const MARQUEE_VALUES = [
  "Quality",
  "Trust",
  "Privacy",
  "Verified",
  "LGBTQ+ Affirming",
  "Premium",
  "Local-First",
];

export function WhyUsSplit() {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeUp>
          <div className="mb-12 lg:mb-16">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Why MasseurMatch
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
              Built different from legacy directories.
            </h2>
          </div>
        </FadeUp>
      </div>

      {/* Values marquee — full-width strip */}
      <InfiniteMarquee
        items={MARQUEE_VALUES}
        separator="•"
        speed={35}
        className="border-y border-border bg-muted/30 py-5 font-display text-xl uppercase tracking-tight text-foreground lg:text-2xl"
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* Block 1: image + stat */}
          <FadeUp delay={0.05} className="lg:col-span-7">
            <div className="flex h-full flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src="/marketing/why-us/primary.jpg"
                  alt="Verified massage therapy professional"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </div>
              <div className="mt-8">
                <p
                  aria-label="98 percent"
                  className="font-display text-[8rem] font-extrabold leading-none tracking-tight"
                >
                  98%
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Profiles verified before they go live
                </p>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Every therapist on MasseurMatch passes a multi-step review covering
                  identity, credentials, and photo quality before their profile is
                  published. No anonymous listings, no unverified claims.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Block 2: stat + image */}
          <FadeUp delay={0.12} className="lg:col-span-5">
            <div className="flex h-full flex-col">
              <div>
                <p
                  aria-label="4.9 star average rating"
                  className="font-display text-[8rem] font-extrabold leading-none tracking-tight"
                >
                  4.9★
                </p>
                <p className="mt-2 text-lg font-semibold">Average therapist rating</p>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Real reviews from verified clients. No fake testimonials, no
                  incentivised ratings — just honest feedback that helps you choose
                  with confidence.
                </p>
              </div>
              <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-3xl">
                <Image
                  src="/marketing/why-us/secondary.jpg"
                  alt="Happy client after professional massage"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
