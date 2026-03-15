import { SearchDirectory } from "@/mm/components/search-directory";
import { SectionHeading } from "@/mm/components/primitives";
import { getCities, getPublicTherapists } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search therapists in real time by city, modality, tier, and profile content.",
  path: "/search",
});

export default async function SearchPage() {
  const [cities, therapists] = await Promise.all([getCities(), getPublicTherapists()]);

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Search"
        title="Filter the directory in real time."
        description="Search by therapist name, modality, pricing context, and city while keeping the current filters in the URL."
      />
      <div className="mt-10">
        <SearchDirectory cities={cities} therapists={therapists} />
      </div>
    </section>
  );
}
