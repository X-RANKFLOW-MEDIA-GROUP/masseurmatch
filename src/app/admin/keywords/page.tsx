import { AdminKeywordsManager } from "@/mm/components/admin-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getDirectorySnapshot } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin keywords",
  description: "Manage the keyword matrix used across city pages and therapist profiles.",
  path: "/admin/keywords",
});

export default async function AdminKeywordsPage() {
  const snapshot = await getDirectorySnapshot();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Keyword matrix."
        description="Create new modality, identity, and intent terms used across the directory."
      />
      <div className="mt-10">
        <AdminKeywordsManager keywords={snapshot.keywords} />
      </div>
    </section>
  );
}
