import { notFound } from "next/navigation";
import { CityDirectoryPage } from "@/mm/components/city-directory-page";
import { getCities, getCityBySlug, getPublicTherapists } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps) {
  const resolvedParams = await params;
  const city = await getCityBySlug(resolvedParams.city);

  if (!city) {
    return buildMetadata({
      title: "City not found",
      description: "The requested city page is not available.",
      path: `/${resolvedParams.city}`,
    });
  }

  return buildMetadata({
    title: `${city.name} therapist directory`,
    description: city.description,
    path: `/${city.slug}`,
    imagePath: `/api/og?city=${city.slug}`,
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const resolvedParams = await params;
  const city = await getCityBySlug(resolvedParams.city);

  if (!city) {
    notFound();
  }

  const therapists = await getPublicTherapists({ city: city.slug });

  return (
    <CityDirectoryPage
      city={city}
      title={`${city.name} therapist directory`}
      eyebrow={`${city.name}, ${city.stateCode}`}
      description={city.description}
      therapistCountLabel={`${therapists.length} therapist profiles in ${city.name}`}
      therapists={therapists}
    />
  );
}
