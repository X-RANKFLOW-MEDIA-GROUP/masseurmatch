import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { getCanonicalCitySlug, resolveCitySlug } from "@/app/_lib/city-routing";
import {
  DALLAS_NEIGHBORHOOD_SLUGS,
  DALLAS_SERVICE_SLUGS,
  DALLAS_SESSION_SLUGS,
  getCanonicalCategoryForCity,
  getCityCanonicalCategorySlugs,
} from "@/app/_lib/dallas-cluster";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string; category: string };

export const revalidate = 60;

export function generateStaticParams(): Params[] {
  return getCities().flatMap((city) => {
    const canonical = getCanonicalCitySlug(city.slug);
    const categories = getCityCanonicalCategorySlugs(canonical);
    return categories.map((category) => ({ city: canonical, category }));
  });
}

function categoryLabel(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug) {
    return createPageMetadata({
      title: "City category",
      description: "City category page for MasseurMatch.",
      path: `/cities/${resolved.city}/${resolved.category}`,
      noIndex: true,
    });
  }

  const city = getCities().find((entry) => entry.slug === citySlug);
  if (!city) {
    return createPageMetadata({
      title: "City category",
      description: "City category page for MasseurMatch.",
      path: `/cities/${resolved.city}/${resolved.category}`,
      noIndex: true,
    });
  }

  const canonicalCity = getCanonicalCitySlug(city.slug);
  const category = getCanonicalCategoryForCity(canonicalCity, resolved.category);
  if (!category) {
    return createPageMetadata({
      title: "City category",
      description: "City category page for MasseurMatch.",
      path: `/cities/${canonicalCity}/${resolved.category}`,
      noIndex: true,
    });
  }

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 1 });

  return createPageMetadata({
    title: `${category.label} in ${city.name}, ${city.stateCode}`,
    description: `Browse ${category.label.toLowerCase()} options in ${city.name}, ${city.stateName}. Compare therapist profiles, availability, incall, outcall, trust signals, and direct contact options.`,
    path: `/cities/${canonicalCity}/${category.slug}`,
    keywords: [category.primaryKeyword, `massage therapists ${city.name.toLowerCase()}`, `${city.stateName.toLowerCase()} massage directory`],
    noIndex: therapists.total === 0,
  });
}

export default async function CanonicalCityCategoryPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug) {
    notFound();
  }

  const city = getCities().find((entry) => entry.slug === citySlug);
  if (!city) {
    notFound();
  }

  const canonicalCity = getCanonicalCitySlug(city.slug);
  const category = getCanonicalCategoryForCity(canonicalCity, resolved.category);

  if (!category) {
    notFound();
  }

  const cityPath = `/cities/${canonicalCity}`;
  const currentPath = `${cityPath}/${category.slug}`;

  const filters =
    category.slug === "gay-massage"
      ? { keyword: "gay" }
      : category.slug === "male-massage"
        ? { keyword: "male" }
        : category.slug === "deep-tissue"
          ? { modality: "deep" }
          : category.slug === "swedish"
            ? { modality: "swedish" }
            : category.slug === "sports-massage"
              ? { keyword: "sports" }
              : category.slug === "incall"
                ? { session: "incall" as const }
                : category.slug === "outcall" || category.slug === "mobile" || category.slug === "hotel"
                  ? { session: "home-visit" as const }
                  : { keyword: category.slug.replace(/-/g, " ") };

  const therapists = await getPublicTherapists({ city: city.name, page: 1, pageSize: 10, ...filters });

  const siblingLinks = getCityCanonicalCategorySlugs(canonicalCity)
    .filter((slug) => slug !== category.slug)
    .slice(0, 10)
    .map((slug) => ({
      href: `${cityPath}/${slug}`,
      label: categoryLabel(slug),
    }));

  const faq = [
    {
      question: `How should I use the ${category.label.toLowerCase()} page in ${city.name}?`,
      answer:
        "Use this page as a focused local filter, then compare profile trust signals, session format, pricing, availability, and specialties before direct outreach.",
    },
    {
      question: "Are profile listings verified?",
      answer:
        "Verification status is shown where available, alongside profile completeness, service details, and clear direct contact expectations.",
    },
    {
      question: `Does this ${city.name} page support mobile, incall, outcall, and hotel intent?`,
      answer:
        "Yes. Session-specific pages for incall, outcall, mobile, and hotel massage are linked from city routes where enough local inventory exists.",
    },
    {
      question: "What if I want a nearby neighborhood instead?",
      answer:
        "Use neighborhood links to move from broad city intent to a more specific local discovery page.",
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cities", path: "/cities" },
          { name: city.name, path: cityPath },
          { name: category.label, path: currentPath },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${category.label} in ${city.name}, ${city.stateCode}`,
          description: `Local discovery route for ${category.label.toLowerCase()} in ${city.name}, ${city.stateName}.`,
          path: currentPath,
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: `${category.label} listings in ${city.name}`,
          path: currentPath,
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{category.kind} route</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{category.label} in {city.name}, {city.stateCode}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
              Browse {category.label.toLowerCase()} options in {city.name}. This page is part of MasseurMatch’s national city, state,
              specialty, incall, and outcall SEO structure for the United States.
            </p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Listings in this route</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cards prioritize modality, local context, session format, pricing entry point, availability, and verification cues.
            </p>
            {therapists.items.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {therapists.items.map((therapist, index) => (
                  <article key={therapist.id} className="rounded-2xl border border-border p-4">
                    <h3 className="font-semibold text-foreground">
                      <Link href={`/therapists/${therapist.slug || therapist.id}`} className="transition hover:text-primary">
                        {therapist.display_name || therapist.full_name || `Therapist ${index + 1}`}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{therapist.modality || "Massage services"} • {therapist.city || city.name}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {therapist.incall_price ? `Incall from $${therapist.incall_price}` : "Incall not listed"} • {therapist.outcall_price ? `Outcall from $${therapist.outcall_price}` : "Outcall not listed"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Verification: {therapist._tier && therapist._tier !== "free" ? "Enhanced profile" : "Directory profile"}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No profiles matched this route yet. This page should stay followable and only become indexable when inventory exists.</p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Neighborhood Discovery</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_NEIGHBORHOOD_SLUGS.map((slug) => (
                <Link key={slug} href={`${cityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {categoryLabel(slug)}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Popular Services</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SERVICE_SLUGS.map((slug) => (
                <Link key={slug} href={`${cityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {categoryLabel(slug)}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Session Pages</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SESSION_SLUGS.map((slug) => (
                <Link key={slug} href={`${cityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {categoryLabel(slug)}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How Direct Contact Works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Open a relevant profile from this route.</li>
              <li>Review modalities, session format, starting rate, trust indicators, and availability.</li>
              <li>Use the listed direct contact channel to confirm logistics and fit.</li>
              <li>Use related city, service, or neighborhood links when intent changes.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Guides Supporting This Route</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <Link href="/guides" className="rounded-full border border-border px-3 py-2 text-foreground">Massage Guides</Link>
              <Link href="/therapists" className="rounded-full border border-border px-3 py-2 text-foreground">Therapist Directory</Link>
              <Link href="/for-therapists" className="rounded-full border border-border px-3 py-2 text-foreground">List Your Profile</Link>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Related Internal Links</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {siblingLinks.map((entry) => (
                <Link key={entry.href} href={entry.href} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {entry.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
