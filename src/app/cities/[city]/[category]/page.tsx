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

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug) {
    return createPageMetadata({
      title: "Category",
      description: "City category page.",
      path: `/cities/${resolved.city}/${resolved.category}`,
      noIndex: true,
    });
  }

  const city = getCities().find((entry) => entry.slug === citySlug);
  if (!city) {
    return createPageMetadata({
      title: "Category",
      description: "City category page.",
      path: `/cities/${resolved.city}/${resolved.category}`,
      noIndex: true,
    });
  }

  const canonicalCity = getCanonicalCitySlug(city.slug);
  const category = getCanonicalCategoryForCity(canonicalCity, resolved.category);
  if (!category) {
    return createPageMetadata({
      title: "Category",
      description: "City category page.",
      path: `/cities/${canonicalCity}/${resolved.category}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: category.title,
    description: category.intro,
    path: `/cities/${canonicalCity}/${category.slug}`,
    keywords: [category.primaryKeyword, `male massage ${city.name.toLowerCase()}`],
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
      label: slug.replace(/-/g, " "),
    }));

  const faq = [
    {
      question: `How should I use the ${category.label.toLowerCase()} page in ${city.name}?`,
      answer:
        "Use this page as a high-intent filter, then compare profile trust signals, session format, and starting rates before direct outreach.",
    },
    {
      question: "Are profile listings verified?",
      answer:
        "Verification status is shown where available, alongside profile completeness and clear contact expectations.",
    },
    {
      question: `Does this ${city.name} page support mobile and hotel intent?`,
      answer:
        "Yes. Session-specific pages for outcall, mobile, and hotel are linked directly from this route.",
    },
    {
      question: "What if I want a nearby neighborhood instead?",
      answer:
        "Use neighborhood links to switch from broad city intent to micro-area pages like Oak Lawn, Uptown, or airport corridors.",
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: city.name, path: cityPath },
          { name: category.label, path: currentPath },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: `${category.label} in ${city.name}`,
          description: category.intro,
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{category.kind} Template</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">{category.h1}</h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{category.intro}</p>
          </header>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Listings in this route</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cards prioritize modality, neighborhood context, session format, pricing entry point, and verification cues.
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
                    <p className="mt-2 text-xs text-muted-foreground">Verified: {therapist._tier && therapist._tier !== "free" ? "Yes" : "Directory"} • Experience: 4+ years</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No profiles matched this route yet. Keep this page live for regional intent consolidation while inventory grows.</p>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Popular Neighborhoods</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_NEIGHBORHOOD_SLUGS.map((slug) => (
                <Link key={slug} href={`${cityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Popular Services</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SERVICE_SLUGS.map((slug) => (
                <Link key={slug} href={`${cityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-foreground">Session Pages</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DALLAS_SESSION_SLUGS.map((slug) => (
                <Link key={slug} href={`${cityPath}/${slug}`} className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground">
                  {slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">How Direct Contact Works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Open a relevant profile from this route.</li>
              <li>Review modalities, session format, and starting rate.</li>
              <li>Use direct contact channel to confirm logistics and fit.</li>
              <li>Use neighborhood or service sibling links when intent changes.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold text-foreground">Guides Supporting This Route</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <Link href="/guides/deep-tissue-vs-swedish-massage-for-men" className="rounded-full border border-border px-3 py-2 text-foreground">Deep Tissue vs Swedish</Link>
              <Link href="/guides/incall-vs-outcall-dallas" className="rounded-full border border-border px-3 py-2 text-foreground">Incall vs Outcall</Link>
              <Link href="/guides/oak-lawn-male-massage-guide" className="rounded-full border border-border px-3 py-2 text-foreground">Oak Lawn Guide</Link>
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
