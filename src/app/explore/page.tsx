import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { JsonLd } from "@/app/_components/JsonLd";
import { createPageMetadata, buildBreadcrumbJsonLd } from "@/app/_lib/seo";
import { getCities } from "@/app/_lib/directory";

const FEATURED_CITY_SLUGS = [
  "atlanta", "austin", "boston", "charlotte", "chicago", "dallas", "denver", "houston",
  "las-vegas", "los-angeles", "miami", "minneapolis", "nashville", "new-york", "orlando",
  "philadelphia", "phoenix", "portland", "san-diego", "san-francisco", "seattle", "st-louis",
  "tampa", "washington-dc",
];

function toStateSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const metadata: Metadata = createPageMetadata({
  title: "Explore therapists by city — MasseurMatch",
  description: "Browse male massage therapists across every major US city and state.",
  path: "/explore",
  keywords: ["massage therapists by city", "massage therapists by state", "explore massage directory"],
});

export default function ExplorePage() {
  const allCities = getCities();
  const featuredCities = FEATURED_CITY_SLUGS.map((slug) => allCities.find((city) => city.slug === slug)).filter(Boolean);
  const states = Array.from(
    new Map(
      [...allCities]
        .sort((a, b) => a.stateName.localeCompare(b.stateName))
        .map((city) => [city.stateCode, city]),
    ).values(),
  );

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Explore", path: "/explore" }])} />

      <main className="min-h-screen bg-[#FAFAFA] pb-20 pt-24 sm:pt-28">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[#E3E3E3] bg-white px-5 py-8 shadow-sm sm:px-8 sm:py-10 lg:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B1E2D]">Explore the directory</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-[#111111] sm:text-5xl">Find a therapist near you</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5F5F5F] sm:text-lg">
              Browse by city or state and connect directly with LGBTQ+-affirming massage therapists.
            </p>
          </div>

          <div className="mt-10 sm:mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E2D]">Popular locations</p>
                <h2 className="mt-2 font-display text-2xl font-black text-[#111111] sm:text-3xl">Featured cities</h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredCities.map((city) => (
                <Link
                  key={city!.slug}
                  href={`/${city!.slug}`}
                  className="group flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-[#E1E1E1] bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#8B1E2D]/35 hover:shadow-md"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EDEE] text-[#8B1E2D]">
                      <MapPin className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-bold text-[#111111]">{city!.name}</span>
                      <span className="block text-sm text-[#6F6F6F]">{city!.stateCode}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#9A9A9A] transition group-hover:translate-x-0.5 group-hover:text-[#8B1E2D]" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 sm:mt-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E2D]">All regions</p>
            <h2 className="mt-2 font-display text-2xl font-black text-[#111111] sm:text-3xl">Browse by state</h2>
            <div className="mt-5 grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {states.map((state) => (
                <Link
                  key={state.stateCode}
                  href={`/states/${toStateSlug(state.stateName)}`}
                  className="flex min-h-12 items-center justify-between rounded-xl border border-[#E1E1E1] bg-white px-4 py-3 text-sm font-semibold text-[#222222] transition hover:border-[#8B1E2D]/40 hover:bg-[#F8EDEE] hover:text-[#8B1E2D]"
                >
                  <span>{state.stateName}</span>
                  <span className="text-xs text-[#8B1E2D]">{state.stateCode}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
