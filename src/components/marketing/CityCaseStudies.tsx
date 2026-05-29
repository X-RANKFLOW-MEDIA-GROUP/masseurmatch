import Image from "next/image";
import Link from "next/link";
import FadeUp from "@/components/motion/FadeUp";
import type { LaunchCityCard } from "@/lib/marketing/home-data";

type Props = {
  launchCities: LaunchCityCard[];
};

export function CityCaseStudies({ launchCities }: Props) {
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 lg:mb-16">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">City coverage</p>
          <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight">
            Start with the strongest local pages.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {launchCities.map((entry, i) => (
            <FadeUp key={entry.href} delay={i * 0.08}>
              <Link
                href={entry.href}
                className="group block rounded-3xl overflow-hidden bg-card border border-border transition-transform duration-300 hover:scale-[1.01]"
              >
                {/* City image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={`/marketing/cities/${entry.city.slug}.jpg`}
                    alt={`${entry.city.name}, ${entry.city.stateCode} massage therapists`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Card body */}
                <div className="p-6 lg:p-8">
                  {/* Route count pill */}
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    {entry.routeCount} live routes
                  </span>

                  {/* City name + state */}
                  <h3 className="mt-4 font-display text-3xl font-bold lg:text-4xl">
                    {entry.city.name}
                    <span className="ml-2 text-lg font-normal text-muted-foreground">
                      {entry.city.stateCode}
                    </span>
                  </h3>

                  {/* Tag chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.highlights.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-3 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Arrow link */}
                  <p className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Open city page
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </p>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
