import { AdminReviewsQueue } from "@/mm/components/admin-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getDirectorySnapshot, getPendingReviews } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Admin reviews",
  description: "Approve or remove therapist reviews from the moderation queue.",
  path: "/admin/reviews",
});

export default async function AdminReviewsPage() {
  const [reviews, snapshot] = await Promise.all([getPendingReviews(), getDirectorySnapshot()]);
  const therapistMap = Object.fromEntries(snapshot.therapists.map((therapist) => [therapist.id, therapist]));

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Review moderation queue."
        description="Approve the reviews you want visible on public profiles and remove the rest."
      />
      <div className="mt-10">
        <AdminReviewsQueue reviews={reviews} therapistMap={therapistMap} />
      </div>
    </section>
  );
}
