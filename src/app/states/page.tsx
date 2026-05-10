import Link from "next/link";
import { getCities } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";

export const metadata = createPageMetadata({
  title: "Find massage therapists by state across the United States",
  description:
    "Browse MasseurMatch state pages across the United States and continue into city, specialty, incall, outcall, and direct contact discovery routes.",
  path: "/states",
  keywords: ["massage therapists by state", "state massage directory", "United States massage directory"],
});

function toStateSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function StatesIndexPage() {
  const states = Array.from(
    new Map(
      getCities()
        .sort((left, right) => left.stateName.localeCompare(right.stateName))
        .map((city) => [city.stateCode, city]),
    ).values(),
  );

  return (
    <section className="page-shell py-10">
      <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">National state directory</p>
          <h1 className="text-3xl font-semibold text-foreground">Find massage therapists by state</h1>
          <p className="text-sm text-muted-foreground">
            Browse state entry points for MasseurMatch’s national U.S. directory. Each state page links into supported city pages and remains aligned with inventory-based SEO rules.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {states.map((state) => (
            <li key={state.stateCode}>
              <Link
                href={`/states/${toStateSlug(state.stateName)}`}
                className="block rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                {state.stateName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
