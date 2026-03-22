import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  type TherapistTier,
  getPublicTherapists,
} from "@/app/_lib/directory";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import TherapistsPageClient from "./TherapistsPageClient";

type TherapistsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 6;

const isTier = (value: string): value is TherapistTier =>
  value === "free" || value === "standard" || value === "pro" || value === "elite";

const getFirstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] || "") : (value || "");

export async function generateMetadata({ searchParams }: TherapistsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = getFirstParam(params.city);
  const modality = getFirstParam(params.modality);
  const page = Number(getFirstParam(params.page) || "1");
  const tier = getFirstParam(params.tier);
  const hasFilters = Boolean(city || modality || tier || page > 1);

  return createPageMetadata({
    title: city ? `${city} therapist listings` : "Therapist directory",
    description: city
      ? `Browse public therapist listings in ${city} and compare specialties, tiers, and profile details.`
      : "Browse the public therapist directory with crawlable listing pages, profile pages, and search-ready filters.",
    path: "/therapists",
    keywords: ["therapist directory", city, modality, tier],
    noIndex: hasFilters,
  });
}

export default async function TherapistsPage({ searchParams }: TherapistsPageProps) {
  const params = await searchParams;
  const city = getFirstParam(params.city);
  const modality = getFirstParam(params.modality);
  const tierValue = getFirstParam(params.tier);
  const tier = isTier(tierValue) ? tierValue : "";
  const page = Math.max(1, Number(getFirstParam(params.page) || "1"));
  const results = await getPublicTherapists({
    city: city || undefined,
    modality: modality || undefined,
    tier: tier || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Therapists", path: "/therapists" },
        ])}
      />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: "Therapist directory",
          description:
            "Browse public massage therapist listings, move into profile pages, and compare specialties across the MasseurMatch directory.",
          path: "/therapists",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Therapist directory listings",
          path: "/therapists",
          items: results.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Directory listings</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
            Crawlable therapist listings with direct paths into city and specialty pages.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This directory page acts as a public index for therapist profiles. It supports search depth, internal
            linking, and paginated discovery while keeping the most important content server-rendered.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/search" className="text-primary hover:underline">
              Search by city
            </Link>
            <Link href="/blog" className="text-primary hover:underline">
              Read the blog
            </Link>
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </div>
        </div>

        <TherapistsPageClient
          items={results.items}
          total={results.total}
          page={page}
          totalPages={totalPages}
          filters={{
            city,
            modality,
            tier,
          }}
        />
      </div>
    </>
  );
}
