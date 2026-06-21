import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getServiceMetadata, getAllServices, NATIONAL_SERVICE_SLUGS } from "@/app/_lib/service-data";
import { getPublicTherapists } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
} from "@/app/_lib/structured-data";

type Params = { service: string };

export const revalidate = 3600; // 1 hour

export function generateStaticParams(): Params[] {
  // Generate on demand for faster production builds
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const serviceData = getServiceMetadata(resolved.service);

  if (!serviceData) {
    return createPageMetadata({
      title: "Service not found",
      description: "This massage service page was not found.",
      path: `/services/${resolved.service}`,
      noIndex: true,
    });
  }

  const therapists = await getPublicTherapists({ page: 1, pageSize: 1 });

  return createPageMetadata({
    title: serviceData.title,
    description: serviceData.description,
    path: `/services/${serviceData.slug}`,
    keywords: [serviceData.primaryKeyword, ...serviceData.longTailKeywords],
    noIndex: therapists.total === 0,
  });
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const serviceData = getServiceMetadata(resolved.service);

  if (!serviceData) {
    notFound();
  }

  const servicePath = `/services/${serviceData.slug}`;

  // Fetch therapists with modality filter
  // Note: This uses the general directory; modality filtering happens in the query or display layer
  const therapists = await getPublicTherapists({ page: 1, pageSize: 10 });

  // Build related service links (exclude current service)
  const relatedServices = NATIONAL_SERVICE_SLUGS.filter((slug) => slug !== serviceData.slug).slice(0, 6);
  const relatedServiceLinks = relatedServices.map((slug) => {
    const meta = getServiceMetadata(slug)!;
    return {
      href: `/services/${slug}`,
      label: meta.label,
    };
  });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: serviceData.label, path: servicePath },
        ])}
      />

      <JsonLd
        data={buildCollectionPageJsonLd({
          name: serviceData.h1,
          description: serviceData.description,
          path: servicePath,
        })}
      />

      <JsonLd
        data={buildItemListJsonLd({
          name: `${serviceData.label} therapist listings`,
          path: servicePath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <JsonLd data={buildFaqJsonLd(serviceData.faqs)} />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Service Directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{serviceData.h1}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{serviceData.intro}</p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How It Works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Browse {serviceData.label.toLowerCase()} therapists in your city.</li>
              <li>Compare trust signals, experience, pricing, and session formats.</li>
              <li>Review the therapist's full profile and contact them directly.</li>
              <li>Confirm details like availability, boundaries, and location before your session.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Browse by City</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find {serviceData.label.toLowerCase()} therapists in your area:</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/cities" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                View All Cities
              </Link>
              <Link href="/explore" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Browse by State
              </Link>
              <Link href="/search" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Search Therapists
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Featured Therapists</h2>
            {therapists.items.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {therapists.items.slice(0, 6).map((therapist) => (
                  <article key={therapist.id} className="rounded-2xl border border-border p-4">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/therapists/${therapist.slug || therapist.id}`} className="transition hover:text-primary">
                        {therapist.display_name || therapist.full_name || "Therapist"}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {therapist.city || "Location not listed"} • {therapist.modality || serviceData.label}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.incall_price ? `Incall from $${therapist.incall_price}` : "Incall not listed"} •{" "}
                      {therapist.outcall_price ? `Outcall from $${therapist.outcall_price}` : "Outcall not listed"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Profiles are being expanded for {serviceData.label.toLowerCase()} massage. Check back soon or search by city.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Other Massage Services</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {relatedServiceLinks.map((entry) => (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  {entry.label} Massage
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Learn More</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/guides" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Massage Guides
              </Link>
              <Link href="/therapists" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                All Therapists
              </Link>
              <Link href="/how-it-works" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                How It Works
              </Link>
              <Link href="/for-therapists" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                List Your Profile
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
