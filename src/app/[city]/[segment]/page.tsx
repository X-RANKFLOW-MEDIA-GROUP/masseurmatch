import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/mm/components/city-directory-page";
import { getCities, getCityBySlug, getPublicTherapists, identitySegments } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

type CitySegmentPageProps = {
  params: Promise<{ city: string; segment: string }>;
};

export async function generateStaticParams() {
  const cities = await getCities();
  const modalitySeeds = ["deep-tissue", "swedish", "thai-massage"];

  return cities.flatMap((city) => [
    ...identitySegments.map((segment) => ({ city: city.slug, segment })),
    ...modalitySeeds.map((segment) => ({ city: city.slug, segment })),
  ]);
}

export async function generateMetadata({ params }: CitySegmentPageProps) {
  const resolvedParams = await params;
  const city = await getCityBySlug(resolvedParams.city);

  if (!city) {
    return buildMetadata({
      title: "Page not found",
      description: "The requested city directory page is not available.",
      path: `/${resolvedParams.city}/${resolvedParams.segment}`,
    });
  }

  const label = resolvedParams.segment.replace(/-/g, " ");
  return buildMetadata({
    title: `${city.name} ${label} therapists`,
    description: `${city.description} Filtered for ${label} discovery in ${city.name}.`,
    path: `/${city.slug}/${resolvedParams.segment}`,
    imagePath: `/api/og?city=${city.slug}&label=${encodeURIComponent(label)}`,
  });
}

export default async function CitySegmentPage({ params }: CitySegmentPageProps) {
  const resolvedParams = await params;
  const city = await getCityBySlug(resolvedParams.city);

  if (!city) {
    notFound();
  }

  const isIdentityPage = identitySegments.includes(resolvedParams.segment as (typeof identitySegments)[number]);
  const therapists = await getPublicTherapists({
    city: city.slug,
    segment: isIdentityPage ? resolvedParams.segment : undefined,
    keyword: isIdentityPage ? undefined : resolvedParams.segment,
  });

  return (
    <CityDirectoryPage
      city={city}
      title={`${city.name} ${resolvedParams.segment.replace(/-/g, " ")} therapists`}
      eyebrow={`${city.name} filter`}
      description={`Use this page to compare ${resolvedParams.segment.replace(/-/g, " ")} profiles in ${city.name} with clear service tags and direct contact details.`}
      therapistCountLabel={`${therapists.length} matching profiles`}
      therapists={therapists}
    />
  );
}
