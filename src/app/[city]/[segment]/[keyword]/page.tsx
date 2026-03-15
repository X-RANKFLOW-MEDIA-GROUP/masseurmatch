import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/mm/components/city-directory-page";
import { getCities, getCityBySlug, getKeywords, getPublicTherapists, identitySegments } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

type CitySegmentKeywordPageProps = {
  params: Promise<{ city: string; segment: string; keyword: string }>;
};

export async function generateStaticParams() {
  const [cities, keywords] = await Promise.all([getCities(), getKeywords()]);

  return cities.flatMap((city) =>
    identitySegments.flatMap((segment) =>
      keywords.slice(0, 6).map((keyword) => ({
        city: city.slug,
        segment,
        keyword: keyword.slug,
      })),
    ),
  );
}

export async function generateMetadata({ params }: CitySegmentKeywordPageProps) {
  const resolvedParams = await params;
  const city = await getCityBySlug(resolvedParams.city);

  if (!city) {
    return buildMetadata({
      title: "Page not found",
      description: "The requested city keyword page is not available.",
      path: `/${resolvedParams.city}/${resolvedParams.segment}/${resolvedParams.keyword}`,
    });
  }

  const label = `${resolvedParams.segment.replace(/-/g, " ")} ${resolvedParams.keyword.replace(/-/g, " ")}`;
  return buildMetadata({
    title: `${city.name} ${label}`,
    description: `${city.description} Filtered for ${label} discovery in ${city.name}.`,
    path: `/${city.slug}/${resolvedParams.segment}/${resolvedParams.keyword}`,
    imagePath: `/api/og?city=${city.slug}&label=${encodeURIComponent(label)}`,
  });
}

export default async function CitySegmentKeywordPage({ params }: CitySegmentKeywordPageProps) {
  const resolvedParams = await params;
  const city = await getCityBySlug(resolvedParams.city);

  if (!city) {
    notFound();
  }

  const segment = identitySegments.includes(resolvedParams.segment as (typeof identitySegments)[number])
    ? resolvedParams.segment
    : undefined;
  const therapists = await getPublicTherapists({
    city: city.slug,
    segment,
    keyword: resolvedParams.keyword,
  });

  return (
    <CityDirectoryPage
      city={city}
      title={`${city.name} ${resolvedParams.segment.replace(/-/g, " ")} ${resolvedParams.keyword.replace(/-/g, " ")} therapists`}
      eyebrow={`${city.name} keyword landing`}
      description={`Profiles filtered by ${resolvedParams.segment.replace(/-/g, " ")} and ${resolvedParams.keyword.replace(/-/g, " ")} for ${city.name}.`}
      therapistCountLabel={`${therapists.length} matching profiles`}
      therapists={therapists}
    />
  );
}
