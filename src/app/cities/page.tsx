import Link from "next/link";
import { getCanonicalCitySlug } from "@/app/_lib/city-routing";
import { getCities } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata = createPageMetadata({
  title: "Find massage therapists by city across the United States",
  description:
    "Browse MasseurMatch city pages across the United States and access local discovery routes by state, city, specialty, incall, outcall, and direct contact options.",
  path: "/cities",
  keywords: ["massage cities", "city massage directory", "massage therapists by city", "national massage directory"],
});

export default function CitiesIndexPage() {
  const cities = getCities();

  return (
    <section className="page-shell py-10">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">National city directory</p>
          <h1 className="text-3xl font-semibold text-foreground">Find massage therapists by city</h1>
          <p className="text-sm text-muted-foreground">
            Browse MasseurMatch city pages across the United States. Each city can connect to local therapist profiles,
            service pages, session types, and neighborhood routes when enough public inventory exists.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {cities.map((city) => (
            <li key={`${city.stateCode}-${city.slug}`}>
              <Link
                href={`/cities/${getCanonicalCitySlug(city.slug)}`}
                className="block rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                {city.name}, {city.stateCode}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
