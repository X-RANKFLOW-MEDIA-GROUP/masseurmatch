import Link from "next/link";
import { JsonLd } from "@/mm/components/json-ld";
import { ButtonLink, Card, SectionHeading } from "@/mm/components/primitives";
import { TherapistCard } from "@/mm/components/therapist-card";
import { getCities, getPublicTherapists } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";
import { buildOrganizationJsonLd } from "@/mm/lib/structured-data";

export const metadata = buildMetadata({
  title: "Direct therapist discovery",
  description:
    "Browse Austin, Dallas, and Houston therapist profiles, compare modalities, and contact providers directly through a cleaner city-first directory.",
  path: "/",
});

export default async function HomePage() {
  const [cities, therapists] = await Promise.all([getCities(), getPublicTherapists()]);
  const featured = therapists.slice(0, 3);

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <section className="page-shell py-12 lg:py-16">
        <div className="hero-panel grid gap-10 px-6 py-10 lg:grid-cols-[1.15fr,0.85fr] lg:px-10 lg:py-14">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Directory first
            </p>
            <h1 className="font-display text-5xl leading-tight text-foreground sm:text-6xl">
              Find massage therapists through city pages that actually help.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              MasseurMatch is a profile directory for independent therapists. Browse city pages, compare modalities,
              review trust signals, and contact providers directly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/therapists">Browse therapists</ButtonLink>
              <ButtonLink href="/register" variant="secondary">
                List your practice
              </ButtonLink>
            </div>
          </div>

          <Card className="grid gap-4 bg-white/85 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Live cities</p>
              <div className="mt-4 grid gap-3">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="surface-panel flex items-center justify-between px-4 py-4 text-sm font-semibold text-foreground"
                  >
                    <span>
                      {city.name}, {city.stateCode}
                    </span>
                    <span className="text-muted-foreground">View city</span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="page-shell py-14">
        <SectionHeading
          eyebrow="Featured profiles"
          title="Profiles with direct contact details and strong city context."
          description="Every listing is built around discovery, not marketplace friction. Visitors can compare styles, neighborhoods, and contact preferences before they reach out."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featured.map((therapist) => {
            const city = cities.find((item) => item.slug === therapist.citySlug);
            return <TherapistCard key={therapist.id} therapist={therapist} city={city} />;
          })}
        </div>
      </section>
    </>
  );
}
