import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/app/_components/city-directory-page";
import {
  buildAreaCopyInput,
  buildAreaFaq,
  buildAreaIntro,
  AREA_NEARBY_MAP,
} from "@/app/_lib/area-copy";
import { getCities, getPublicTherapists } from "@/app/_lib/directory";
import { getLaunchAreaPaths, isLaunchUrl } from "@/app/_lib/launch-urls";
import { createPageMetadata } from "@/app/_lib/metadata";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd } from "@/app/_lib/structured-data";

type Params = { city: string; area: string };

export const revalidate = 60;

export function generateStaticParams(): Params[] {
  return getLaunchAreaPaths().map((path) => {
    const [city, , area] = path.split("/").filter(Boolean);
    return { city: city || "", area: area || "" };
  });
}

function formatAreaLabel(areaSlug: string) {
  return areaSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const city = getCities().find((entry) => entry.slug === resolved.city);

  if (!city) {
    return createPageMetadata({
      title: "Neighborhood",
      description: "City area page.",
      path: `/${resolved.city}/areas/${resolved.area}`,
      noIndex: true,
    });
  }

  const areaLabel = formatAreaLabel(resolved.area);
  const { total } = await getPublicTherapists({ city: city.name, keyword: areaLabel, page: 1, pageSize: 2 });
  // noindex if fewer than 2 profiles — prevents thin-content indexation
  const noIndex = total < 2;

  return createPageMetadata({
    title: `Gay Massage in ${areaLabel}, ${city.name} | Verified Male Therapists | MasseurMatch`,
    description: `Explore verified male massage therapists in ${areaLabel}, ${city.name}. Compare session formats, starting rates, and direct contact options for this neighborhood.`,
    path: `/${city.slug}/areas/${resolved.area}`,
    keywords: [`${areaLabel.toLowerCase()} gay massage`, `${city.name.toLowerCase()} male massage`, `massage near ${areaLabel.toLowerCase()}`],
    noIndex,
  });
}

export default async function CityAreaPage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const city = getCities().find((entry) => entry.slug === resolved.city);

  if (!city) {
    notFound();
  }

  const routePath = `/${city.slug}/areas/${resolved.area}`;
  if (!isLaunchUrl(routePath)) {
    notFound();
  }

  const areaLabel = formatAreaLabel(resolved.area);
  const therapists = await getPublicTherapists({ city: city.name, keyword: areaLabel, page: 1, pageSize: 9 });

  // ── Build unique local copy from real data ────────────────────────────────────
  const copyInput = buildAreaCopyInput({
    area: areaLabel,
    city: city.name,
    therapists: therapists.items,
  });
  const intro = buildAreaIntro(copyInput);
  const faq = buildAreaFaq(copyInput);

  // Nearby-area quick links derived from the static map
  const nearbyAreaSlugs = AREA_NEARBY_MAP[resolved.area] ?? [];
  const nearbyLinks = nearbyAreaSlugs
    .map((label) => ({
      href: `/${city.slug}/areas/${label.toLowerCase().replace(/ /g, "-")}`,
      label,
    }))
    .filter((link) => isLaunchUrl(link.href));

  // Sibling service-type links
  const siblingServiceLinks = [
    { href: `/${city.slug}/wellness/outcall`,       label: "Outcall" },
    { href: `/${city.slug}/wellness/incall`,        label: "Incall" },
    { href: `/${city.slug}/wellness/deep-tissue`,   label: "Deep tissue" },
    { href: `/${city.slug}/wellness/mobile-massage`, label: "Mobile" },
    { href: `/${city.slug}/wellness/hotel-massage`, label: "Hotel sessions" },
  ].filter((link) => isLaunchUrl(link.href));

  return (
    <CityDirectoryPage
      eyebrow={`${city.name} · neighborhood`}
      title={`Gay Massage in ${areaLabel}, ${city.name}`}
      intro={intro}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: city.name, path: `/${city.slug}` },
        { name: areaLabel, path: routePath },
      ])}
      collectionJsonLd={buildCollectionPageJsonLd({
        name: `Gay massage in ${areaLabel}, ${city.name}`,
        description: intro.slice(0, 200),
        path: routePath,
      })}
      itemListJsonLd={buildItemListJsonLd({
        name: `${areaLabel} listings in ${city.name}`,
        path: routePath,
        items: therapists.items.map((item) => ({
          name: item.display_name || item.full_name || "Therapist",
          path: `/therapists/${item.slug || item.id}`,
        })),
      })}
      leadLinks={[
        { href: `/${city.slug}`, label: `Back to ${city.name}` },
        ...(siblingServiceLinks.length ? [siblingServiceLinks[0]] : []),
        { href: "/guides/oak-lawn-male-massage-guide", label: "Neighborhood guide" },
      ]}
      linkSections={[
        ...(nearbyLinks.length
          ? [{
              title: "Nearby areas also covered",
              layout: "chips" as const,
              description: `Therapists in ${areaLabel} sometimes cover adjacent neighborhoods. These pages use the same trust-first format.`,
              items: nearbyLinks,
            }]
          : []),
        ...(siblingServiceLinks.length
          ? [{
              title: `Popular service types in ${areaLabel}`,
              layout: "chips" as const,
              items: siblingServiceLinks,
            }]
          : []),
      ]}
      therapists={therapists.items}
      listingTitle={`Therapists serving ${areaLabel}`}
      listingDescription={
        therapists.items.length >= 2
          ? `${therapists.items.length} profiles matched to ${areaLabel}. Cards show real session formats, pricing, and direct contact options.`
          : `Listings for ${areaLabel} are actively growing. The nearby area and service pages above have broader coverage while this neighborhood expands.`
      }
      emptyTitle={`No listings matched ${areaLabel} yet.`}
      emptyDescription="This page remains published to consolidate neighborhood intent and direct search traffic to the broader Dallas routes while local inventory grows."
      faqTitle={`${areaLabel} Massage — Common Questions`}
      faqItems={faq}
    />
  );
}
