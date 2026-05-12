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
    title: city ? `Massage therapists in ${city}` : "Verified massage therapists across the United States",
    description: city
      ? `Browse verified massage therapists in ${city}. Compare specialties, incall, outcall, trust signals, profile tiers, and direct contact details.`
      : "Browse verified LGBTQ+-affirming massage therapists across the United States by state, city, specialty, incall, outcall, trust signals, and direct contact options.",
    path: "/therapists",
    keywords: [
      "national massage therapist directory",
      "massage therapists across the United States",
      "massage therapists by city",
      "massage therapists by state",
      city,
      modality,
      tier,
    ],
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
          name: "Verified massage therapists across the United States",
          description:
            "Browse public massage therapist listings across the United States, move into state and city discovery paths, and compare specialties, trust signals, incall, outcall, and direct contact options.",
          path: "/therapists",
        })}
      />
      <JsonLd
        data={buildItemListJsonLd({
          name: "Nationwide therapist directory listings",
          path: "/therapists",
          items: results.items.map((item) => ({
            name: item.display_name || item.full_name || "Therapist",
            path: `/therapists/${item.slug || item.id}`,
          })),
        })}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">National directory</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
            Browse verified massage therapists across the United States.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Search MasseurMatch by state, city, specialty, incall, outcall, availability, profile tier, and trust signals.
            Each public profile links into local discovery paths while filtered views stay out of the index to avoid thin duplicate pages.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/cities" className="text-primary hover:underline">
              Browse cities
            </Link>
            <Link href="/search" className="text-primary hover:underline">
              Search by city or specialty
            </Link>
            <Link href="/for-therapists" className="text-primary hover:underline">
              List your profile
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
