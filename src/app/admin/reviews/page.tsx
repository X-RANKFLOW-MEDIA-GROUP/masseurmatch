"use client";

import { useEffect, useState } from "react";
import AdminReviewsManager from "@/app/admin/_components/AdminReviewsManager";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Loader2 } from "lucide-react";
import type { AdminImportedReview } from "@/app/admin/_lib/loaders";

export default function AdminReviewsPage() {
  const [items, setItems] = useState<AdminImportedReview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json();
      })
      .then((data) => {
        setItems(data.items);
        if (data.error) setError(data.error);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <AdminReviewsManager initialReviews={items} />
        </div>
      )}
    </div>
  );
}
