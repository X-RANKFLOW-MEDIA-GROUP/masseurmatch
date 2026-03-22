import AdminReviewsManager from "@/app/admin/_components/AdminReviewsManager";
import { loadImportedReviews } from "@/app/admin/_lib/loaders";

export default async function AdminReviewsPage() {
  const { items, error } = await loadImportedReviews();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Admin Reviews</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Review imported testimonials, fix metadata, or remove bad entries.
      </p>

      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Reviews could not be loaded from Supabase admin right now: {error}
        </div>
      ) : null}

      <AdminReviewsManager initialReviews={items} />
    </div>
  );
}
