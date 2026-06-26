import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  type TherapistTier,
  getPublicTherapists,
  getProfilePhotosBatch,
} from "@/app/_lib/directory"; // getProfilePhotosBatch used below
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
      ? `Browse verified massage therapists in ${city}. Compare specialties, incall, outcall, trust signals, and direct contact details.`
      : "Browse verified LGBTQ+-affirming massage therapists across the United States by state, city, specialty, incall, outcall, and direct contact options.",
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

  const realIds = results.items
    .filter((t) => t.id && !t.id.startsWith("fallback-"))
    .map((t) => t.id);
  const photoBatch = realIds.length > 0 ? await getProfilePhotosBatch(realIds, 1) : new Map();

  const itemsWithPhotos = results.items.map((t) => {
    if (!t.id || t.id.startsWith("fallback-")) return t;
    const photos = photoBatch.get(t.id) ?? [];
    const primary = photos.find((p) => p.is_primary) ?? photos[0];
    return primary ? { ...t, profile_photo: primary.storage_path } : t;
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
            "Browse public massage therapist listings across the United States.",
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

      <div className="min-h-screen bg-[#FAF8F5]">
        {/* ── Hero / page header ──────────────────────────────────────────── */}
        <div className="relative bg-[#060E1A] px-4 py-12 sm:px-6 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-[#FF8A1F]/[0.06] blur-3xl" />
            <div className="absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-emerald-500/[0.05] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF8A1F]">National directory</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find your massage therapist.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
              Browse verified LGBTQ+-affirming therapists across the United States.
              Your location is detected automatically — or search by city and specialty.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <Link href="/cities" className="font-semibold text-[#FF8A1F] hover:text-[#e67600]">
                Browse by city
              </Link>
              <Link href="/search" className="font-semibold text-white/60 hover:text-white">
                Advanced search
              </Link>
              <Link href="/for-therapists" className="font-semibold text-white/60 hover:text-white">
                List your profile
              </Link>
            </div>
          </div>
        </div>

        {/* ── Explore section (filter + grid) ────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <TherapistsPageClient
            items={itemsWithPhotos}
            total={results.total}
            page={page}
            totalPages={totalPages}
            filters={{ city, modality, tier }}
          />
        </div>
      </div>
    </>
  );
}
