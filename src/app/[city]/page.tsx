import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd } from "@/app/_lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  return {
    title: `Verified Male Massage Therapists in ${cityName} | MasseurMatch`,
    description: `Find safe, verified, and premium male massage therapists in ${cityName}. Direct contact. No middleman fees.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  return (
    <main className="container mx-auto min-h-screen max-w-6xl px-4 py-16">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
          { name: cityName, path: `/${city}` },
        ])}
      />

      <header className="mb-12 text-center">
        <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-primary">Direct Connection</span>
        <h1 className="mb-6 text-4xl font-black tracking-tight md:text-6xl">Verified Male Massage Therapists in {cityName}</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Connect directly with trusted, ID-verified professionals in {cityName}. Your safety and comfort are our top priorities. No
          hidden fees, no middlemen.
        </p>
      </header>

      <div className="mb-12 grid gap-4 md:grid-cols-4">
        {["Deep Tissue", "Swedish", "Outcall", "Incall"].map((tag) => (
          <Link
            key={tag}
            href={`/${city}/wellness/${tag.toLowerCase().replace(" ", "-")}`}
            className="rounded-xl border border-border p-4 text-center font-medium transition hover:bg-secondary/50"
          >
            {tag} Massage
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl font-bold">Browse {cityName} Inventory</h2>
        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
          We are currently verifying premium therapists in the {cityName} area. Check back soon or expand your search.
        </p>
        <Link
          href="/search"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Search All Locations
        </Link>
      </div>
    </main>
  );
}
