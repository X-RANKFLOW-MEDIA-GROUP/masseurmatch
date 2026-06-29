import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { getVerifiedTherapistPageConfig } from "@/app/_lib/verified-therapist-pages";
import { createPageMetadata } from "@/app/_lib/metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
} from "@/app/_lib/structured-data";
import { Users } from "lucide-react";
import { IconAward, IconShield, IconStar } from "@/components/icons";

type Params = { city: string };

export const revalidate = 3600;

export function generateStaticParams(): Params[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const city = getCities().find((c) => c.slug === resolved.city);
  const config = city ? getVerifiedTherapistPageConfig(city.slug) : null;

  if (!city || !config) {
    return createPageMetadata({
      title: "Verified therapists",
      description: "Browse verified massage therapists",
      path: `/cities/${resolved.city}/verified-therapists`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `Verified Massage Therapists in ${city.name}, ${city.stateCode} | MasseurMatch`,
    description: `Browse verified and trusted massage therapists in ${city.name}. All therapists on MasseurMatch meet our professional standards and verification requirements.`,
    path: `/cities/${city.slug}/verified-therapists`,
    keywords: [
      `verified massage therapists ${city.name.toLowerCase()}`,
      `trusted massage therapists ${city.name.toLowerCase()}`,
      `professional massage therapists ${city.name.toLowerCase()}`,
      `licensed massage therapist ${city.name.toLowerCase()}`,
    ],
  });
}

export default async function VerifiedTherapistsPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const city = getCities().find((c) => c.slug === resolved.city);
  const config = getVerifiedTherapistPageConfig(city?.slug || "");

  if (!city || !config) {
    notFound();
  }

  const pagePath = `/cities/${city.slug}/verified-therapists`;
  const therapists = await getPublicTherapists({
    city: city.name,
    page: 1,
    pageSize: 12,
  });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          { name: city.name, path: `/cities/${city.slug}` },
          { name: "Verified Therapists", path: pagePath },
        ])}
      />

      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `Verified Massage Therapists in ${city.name}, ${city.stateCode}`,
          description: `Browse verified and trusted professional massage therapists in ${city.name}. All profiles meet MasseurMatch professional standards.`,
          path: pagePath,
        })}
      />

      <JsonLd
        data={buildItemListJsonLd({
          name: `Verified therapists in ${city.name}`,
          path: pagePath,
          items: therapists.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <JsonLd data={buildFaqJsonLd(config.faqs)} />

      <section className="page-shell py-10">
        <div className="space-y-8">
          <header className="rounded-3xl border border-border bg-background p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconShield size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Trust & Safety</p>
                <h1 className="mt-2 text-3xl font-semibold text-foreground">Verified Therapists in {city.name}</h1>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
                  All massage therapists on MasseurMatch meet our professional verification standards. Every profile is reviewed to ensure
                  accuracy, professionalism, and transparency so you can book with confidence.
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            {config.verificationBenefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">{benefit}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">What Makes a Therapist Verified?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {config.trustSignals.map((signal) => (
                <div key={signal} className="flex items-start gap-3">
                  <IconAward size={20} className="shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">{signal}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Verified Therapists in {city.name}</h2>
            {therapists.items.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {therapists.items.map((therapist) => (
                  <article key={therapist.id} className="rounded-2xl border border-border p-4">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/therapists/${therapist.slug || therapist.id}`} className="transition hover:text-primary">
                        {therapist.display_name || therapist.full_name || "Therapist"}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {city.name} • {therapist.modality || "Massage services"}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <IconStar size={16} className="text-primary" />
                      <span className="text-xs font-semibold text-foreground">Verified Professional</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.incall_price ? `Incall from $${therapist.incall_price}` : "—"} •{" "}
                      {therapist.outcall_price ? `Outcall from $${therapist.outcall_price}` : "—"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Verified therapist profiles are being expanded for {city.name}. Check back soon or browse all{" "}
                <Link href={`/cities/${city.slug}`} className="font-semibold text-primary hover:underline">
                  {city.name} therapists
                </Link>
                .
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How to Evaluate Therapists</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
              <li>
                <strong className="text-foreground">Check the profile</strong> — Review experience, specialties, pricing, and session formats
              </li>
              <li>
                <strong className="text-foreground">Look for trust signals</strong> — Verified credentials, years of experience, client feedback
              </li>
              <li>
                <strong className="text-foreground">Contact directly</strong> — Ask about certifications, specialties, availability, boundaries
              </li>
              <li>
                <strong className="text-foreground">Confirm details</strong> — Discuss location, session length, pricing, and cancellation policy before booking
              </li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Browse More Options</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/cities/${city.slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                All {city.name} Therapists
              </Link>
              <Link href={`/cities/${city.slug}/services/deep-tissue`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Deep Tissue Specialists
              </Link>
              <Link href="/cities" className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent">
                Other Cities
              </Link>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
