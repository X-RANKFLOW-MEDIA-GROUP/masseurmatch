import AdminReviewsManager from "@/app/admin/_components/AdminReviewsManager";
import { loadImportedReviews } from "@/app/admin/_lib/loaders";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";

export default async function AdminReviewsPage() {
  const { items, error } = await loadImportedReviews();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews"
        description="Review imported testimonials, fix metadata, or remove bad entries."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Reviews could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <AdminReviewsManager initialReviews={items} />
      </div>
    </div>
  );
}
