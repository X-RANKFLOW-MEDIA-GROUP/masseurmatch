import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/json-ld";
import { getAllServices } from "@/app/_lib/service-data";
import { createPageMetadata } from "@/app/_lib/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
} from "@/app/_lib/structured-data";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = createPageMetadata({
  title: "Massage Services & Specialties | MasseurMatch",
  description:
    "Explore different massage types and specialties on MasseurMatch. From deep tissue and Swedish to sports massage and lymphatic drainage. Find the right massage therapy for your needs.",
  path: "/services",
  keywords: [
    "massage types",
    "massage specialties",
    "deep tissue massage",
    "Swedish massage",
    "sports massage",
    "Thai massage",
    "hot stone massage",
    "lymphatic drainage",
    "massage modalities",
    "types of massage therapy",
  ],
});

export default function ServicesPage() {
  const services = getAllServices();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ];

  const serviceItems = services.map((service) => ({
    name: service.label,
    path: `/services/${service.slug}`,
  }));

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbs)} />

      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Massage Services & Specialties",
          description:
            "Explore different types of massage therapy including deep tissue, Swedish, sports, Thai, and specialized techniques. Find the right service for your wellness needs.",
          path: "/services",
        })}
      />

      <JsonLd
        data={buildItemListJsonLd({
          name: "Massage Services & Specialties",
          path: "/services",
          items: serviceItems,
        })}
      />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Services</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Massage Services & Specialties</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              MasseurMatch therapists offer a wide range of massage specialties to meet different needs, from deep tissue work and sports recovery to relaxation and specialized techniques.
              Explore each service type below to find the right therapist for your wellness goals.
            </p>
          </header>

          <section className="space-y-4">
            {services.map((service) => (
              <article key={service.slug} className="rounded-3xl border border-border bg-background p-6 transition hover:border-primary/50">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{service.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{service.intro}</p>
                  </div>

                  <ul className="space-y-1 pl-5 text-sm text-muted-foreground">
                    {service.longTailKeywords.slice(0, 3).map((keyword) => (
                      <li key={keyword} className="list-disc">
                        {keyword}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Browse {service.label} Therapists
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Can't Find Your Service?</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              MasseurMatch is continuously expanding its service directory. If you're looking for a specific massage specialty not listed here:
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Use the search feature to find therapists by keywords.</li>
              <li>Browse your city directory to see what services are available locally.</li>
              <li>Contact a therapist directly — many offer services beyond what's listed.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How to Choose a Massage Service</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                <strong className="text-foreground">Assess your needs:</strong> Are you looking for relaxation, pain relief, recovery, or specific therapeutic benefits?
              </p>
              <p>
                <strong className="text-foreground">Compare specialties:</strong> Different therapists may specialize in different techniques even within the same service type.
              </p>
              <p>
                <strong className="text-foreground">Review trust signals:</strong> Look at therapist experience, certifications, and client feedback on their profiles.
              </p>
              <p>
                <strong className="text-foreground">Consider session format:</strong> Choose incall (at therapist's studio), outcall (at your location), or mobile sessions based on your convenience.
              </p>
              <p>
                <strong className="text-foreground">Communicate directly:</strong> Contact your chosen therapist to discuss your specific needs and any health considerations.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Explore More</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/cities" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Browse Cities
              </Link>
              <Link href="/therapists" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                All Therapists
              </Link>
              <Link href="/guides" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Massage Guides
              </Link>
              <Link href="/search" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Search
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
