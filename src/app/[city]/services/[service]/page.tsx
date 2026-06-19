import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { getServiceMetadata } from "@/app/_lib/service-data";
import { createPageMetadata } from "@/app/_lib/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
} from "@/app/_lib/structured-data";
import { siteUrl } from "@/lib/site";

type Params = { city: string; service: string };

export const revalidate = 3600;

export function generateStaticParams(): Params[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const city = getCities().find((c) => c.slug === resolved.city);
  const serviceData = getServiceMetadata(resolved.service);

  if (!city || !serviceData) {
    return createPageMetadata({
      title: "City service not found",
      description: "This city service page was not found.",
      path: `/cities/${resolved.city}/services/${resolved.service}`,
      noIndex: true,
    });
  }

  const therapists = await getPublicTherapists({
    city: city.name,
    page: 1,
    pageSize: 1,
  });

  return createPageMetadata({
    title: `${serviceData.label} Massage in ${city.name}, ${city.stateCode} | MasseurMatch`,
    description: `Find verified ${serviceData.label.toLowerCase()} massage therapists in ${city.name}, ${city.stateName}. Compare pricing, specialties, incall & outcall options. Direct contact.`,
    path: `/cities/${city.slug}/services/${serviceData.slug}`,
    keywords: [
      `${serviceData.label.toLowerCase()} massage ${city.name.toLowerCase()}`,
      `${serviceData.label.toLowerCase()} massage therapist ${city.name.toLowerCase()}`,
      `${serviceData.label.toLowerCase()} massage near ${city.name.toLowerCase()}`,
      `${city.name.toLowerCase()} ${serviceData.label.toLowerCase()} massage`,
    ],
    noIndex: therapists.total === 0,
  });
}

export default async function CityServicePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const city = getCities().find((c) => c.slug === resolved.city);
  const serviceData = getServiceMetadata(resolved.service);

  if (!city || !serviceData) {
    notFound();
  }

  const pagePath = `/cities/${city.slug}/services/${serviceData.slug}`;
  const therapists = await getPublicTherapists({
    city: city.name,
    page: 1,
    pageSize: 10,
  });

  // Create FAQs specific to this city-service combo
  const faq = [
    {
      question: `Where can I find ${serviceData.label.toLowerCase()} massage in ${city.name}?`,
      answer: `MasseurMatch has verified ${serviceData.label.toLowerCase()} massage therapists in ${city.name}, ${city.stateName}. Browse our listings below, compare profiles, trust signals, and pricing, then contact your chosen therapist directly.`,
    },
    {
      question: `Is ${serviceData.label.toLowerCase()} massage available incall or outcall in ${city.name}?`,
      answer: `Yes. Many ${city.name} therapists offer both incall (at their location) and outcall (at your home or hotel). Check individual profiles for their specific session formats and availability.`,
    },
    {
      question: `What's the average cost of ${serviceData.label.toLowerCase()} massage in ${city.name}?`,
      answer: `Pricing varies by therapist experience, session length, and location. Browse therapist profiles on this page to see pricing anchors. Contact directly to confirm rates and any package deals.`,
    },
    {
      question: `How do I know a ${city.name} massage therapist is verified?`,
      answer: `MasseurMatch profiles display trust signals including experience, certifications, client feedback, and response times. Look for these indicators when choosing your therapist.`,
    },
    {
      question: `Can I book ${serviceData.label.toLowerCase()} massage same-day in ${city.name}?`,
      answer: `Availability varies by therapist. Contact your chosen therapist directly to check same-day or next-day availability. Many ${city.name} therapists can accommodate quick requests.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          { name: city.name, path: `/cities/${city.slug}` },
          { name: serviceData.label, path: pagePath },
        ])}
      />

      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${serviceData.label} Massage Therapists in ${city.name}, ${city.stateCode}`,
          description: `Browse verified ${serviceData.label.toLowerCase()} massage therapists in ${city.name}. Compare specialties, pricing, incall & outcall options, and contact directly.`,
          path: pagePath,
        })}
      />

      <JsonLd
        data={buildItemListJsonLd({
          name: `${serviceData.label} therapists in ${city.name}`,
          path: pagePath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <JsonLd data={buildFaqJsonLd(faq)} />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Local Service Directory</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              {serviceData.label} Massage in {city.name}, {city.stateCode}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              {serviceData.intro} Browse verified {serviceData.label.toLowerCase()} therapists in {city.name} offering incall, outcall,
              and mobile sessions. Compare trust signals, pricing, and contact providers directly without a booking middleman.
            </p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">About {serviceData.label} Massage</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{serviceData.intro}</p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {serviceData.longTailKeywords.slice(0, 3).map((keyword) => (
                <p key={keyword}>
                  <span className="font-semibold text-foreground">•</span> {keyword}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">{serviceData.label} Therapists in {city.name}</h2>
            {therapists.items.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {therapists.items.slice(0, 8).map((therapist) => (
                  <article key={therapist.id} className="rounded-2xl border border-border p-4">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/therapists/${therapist.slug || therapist.id}`} className="transition hover:text-primary">
                        {therapist.display_name || therapist.full_name || "Therapist"}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {city.name} • {therapist.modality || serviceData.label}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.incall_price ? `Incall from $${therapist.incall_price}` : "—"} •{" "}
                      {therapist.outcall_price ? `Outcall from $${therapist.outcall_price}` : "—"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                {serviceData.label} massage profiles are being expanded for {city.name}. Check back soon or browse all {city.name}{" "}
                <Link href={`/cities/${city.slug}`} className="font-semibold text-primary hover:underline">
                  therapists
                </Link>
                .
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Other Session Types in {city.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/cities/${city.slug}/services/swedish`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Swedish
              </Link>
              <Link href={`/cities/${city.slug}/services/deep-tissue`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Deep Tissue
              </Link>
              <Link href={`/cities/${city.slug}/services/sports`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Sports
              </Link>
              <Link href={`/cities/${city.slug}/services/mobile`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Mobile
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Browse Other Cities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/cities" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                All Cities
              </Link>
              <Link href={`/cities/${city.slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                {city.name} Directory
              </Link>
              <Link href="/services" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                All Services
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
