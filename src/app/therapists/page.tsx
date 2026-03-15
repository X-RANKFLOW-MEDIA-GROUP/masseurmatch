import type { TherapistTier } from "@/mm/types";
import { SectionHeading } from "@/mm/components/primitives";
import { TherapistCard } from "@/mm/components/therapist-card";
import { getCities, getPublicTherapists } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

const pageSize = 6;

export const metadata = buildMetadata({
  title: "Therapists",
  description: "Browse therapist cards, filter by city or tier, and compare profiles across the MasseurMatch directory.",
  path: "/therapists",
});

type TherapistsPageProps = {
  searchParams?: Promise<{
    city?: string;
    modality?: string;
    page?: string;
    tier?: TherapistTier;
  }>;
};

export default async function TherapistsPage({ searchParams }: TherapistsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const [cities, therapists] = await Promise.all([
    getCities(),
    getPublicTherapists({
      city: resolvedSearchParams?.city,
      modality: resolvedSearchParams?.modality,
      tier: resolvedSearchParams?.tier,
    }),
  ]);

  const page = Number(resolvedSearchParams?.page || "1");
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const paginated = therapists.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Directory"
        title="Compare therapist cards by city, modality, and listing tier."
        description="Therapist profiles focus on profile clarity, trust signals, and direct contact information."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {paginated.map((therapist) => {
          const city = cities.find((item) => item.slug === therapist.citySlug);
          return <TherapistCard key={therapist.id} therapist={therapist} city={city} />;
        })}
      </div>
    </section>
  );
}
