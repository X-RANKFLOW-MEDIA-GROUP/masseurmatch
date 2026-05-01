import Link from "next/link";
import { getCanonicalCitySlug } from "@/app/_lib/city-routing";
import { getCities } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata = createPageMetadata({
  title: "Cities",
  description:
    "Browse MasseurMatch city pages and access canonical local discovery routes by city and state.",
  path: "/cities",
  keywords: ["massage cities", "city massage directory", "male massage by city"],
});

export default function CitiesIndexPage() {
  const cities = getCities();

  return (
    <section className="page-shell py-10">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">City Directory</p>
          <h1 className="text-3xl font-semibold text-foreground">Browse Cities</h1>
          <p className="text-sm text-muted-foreground">
            Canonical local pages live under the /cities tree. Pick a city to view service, session-type, and neighborhood routes.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {cities.map((city) => (
            <li key={city.slug}>
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
