import { AdminCitiesManager } from "@/mm/components/admin-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getDirectorySnapshot } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin cities",
  description: "Manage city records and view therapist counts per city.",
  path: "/admin/cities",
});

export default async function AdminCitiesPage() {
  const snapshot = await getDirectorySnapshot();
  const therapistCounts = snapshot.therapists.reduce<Record<string, number>>((accumulator, therapist) => {
    accumulator[therapist.citySlug] = (accumulator[therapist.citySlug] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="City coverage management."
        description="Track how many therapists are attached to each city and add new city records as coverage expands."
      />
      <div className="mt-10">
        <AdminCitiesManager cities={snapshot.cities} therapistCounts={therapistCounts} />
      </div>
    </section>
  );
}
