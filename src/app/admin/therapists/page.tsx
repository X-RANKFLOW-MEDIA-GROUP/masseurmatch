import { AdminTherapistsTable } from "@/mm/components/admin-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getCities, getDirectorySnapshot } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin therapists",
  description: "Approve, suspend, search, filter, and delete therapist listings from the MasseurMatch admin console.",
  path: "/admin/therapists",
});

export default async function AdminTherapistsPage() {
  const [cities, snapshot] = await Promise.all([getCities(), getDirectorySnapshot()]);

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Therapist moderation and status control."
        description="Filter by city, tier, and listing state, then approve, suspend, or delete therapist records."
      />
      <div className="mt-10">
        <AdminTherapistsTable cities={cities} therapists={snapshot.therapists} />
      </div>
    </section>
  );
}
