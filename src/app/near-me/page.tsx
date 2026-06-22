import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/app/_lib/structured-data";
import { MapPin, Smartphone, Zap } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  title: "Massage Therapists Near Me | Find Local Options | MasseurMatch",
  description:
    "Find verified massage therapists near you. Browse local options by city, compare services, specialties, and pricing. Direct contact with therapists in your area.",
  path: "/near-me",
  keywords: [
    "massage near me",
    "massage therapist near me",
    "local massage therapy",
    "massage therapists in my area",
    "find massage near me",
    "massage services near me",
    "male massage near me",
    "gay massage near me",
  ],
});

export default function NearMePage() {
  const cities = getCities();
  const topCities = cities.slice(0, 12);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Near Me", path: "/near-me" },
        ])}
      />

      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Find Massage Therapists Near Me",
          description: "Search verified massage therapists by city and location. Compare specialties, services, and book directly.",
          path: "/near-me",
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Location-Based Search</p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">Find Massage Therapists Near You</h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
                  Search verified massage therapists in your area. Select your city below to browse local therapists, compare services, and
                  connect directly with providers offering incall, outcall, and mobile sessions.
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-4">
              <Smartphone className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Mobile Friendly</h3>
              <p className="mt-1 text-xs text-muted-foreground">Search and book on any device, anytime</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Local Options</h3>
              <p className="mt-1 text-xs text-muted-foreground">Find therapists in your city or nearby areas</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <Zap className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">Quick Results</h3>
              <p className="mt-1 text-xs text-muted-foreground">Fast search and direct contact with therapists</p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Browse by City</h2>
            <p className="mt-2 text-sm text-muted-foreground">Select your location to see available massage therapists</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {topCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary/5"
                >
                  {city.name}, {city.stateCode}
                </Link>
              ))}
              <Link
                href="/cities"
                className="rounded-lg border border-border bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                View All Cities
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Search by Service Type</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find therapists offering specific massage types</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/services/deep-tissue" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Deep Tissue
              </Link>
              <Link href="/services/swedish" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Swedish
              </Link>
              <Link href="/services/sports" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Sports
              </Link>
              <Link href="/services/mobile" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Mobile
              </Link>
              <Link href="/services" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                All Services
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How to Find the Right Therapist</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
              <li>
                <strong className="text-foreground">Select your city</strong> — Browse available therapists in your area
              </li>
              <li>
                <strong className="text-foreground">Filter by service</strong> — Choose massage type (deep tissue, Swedish, sports, etc.)
              </li>
              <li>
                <strong className="text-foreground">Compare options</strong> — Review pricing, specialties, session formats (incall/outcall)
              </li>
              <li>
                <strong className="text-foreground">Contact directly</strong> — Reach out to discuss your needs and confirm availability
              </li>
              <li>
                <strong className="text-foreground">Book your session</strong> — Confirm details and schedule at your convenience
              </li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Session Options Available</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">Incall Massage</p>
                <p className="text-muted-foreground">Visit the therapist's studio or location for your session</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Outcall Massage</p>
                <p className="text-muted-foreground">Therapist travels to your home, hotel, or preferred location</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Mobile Massage</p>
                <p className="text-muted-foreground">Portable sessions for convenience and flexibility</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
