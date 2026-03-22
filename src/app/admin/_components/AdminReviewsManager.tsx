"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/app/_lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type AdminImportedReview = {
  id: string;
  profile_id: string;
  review_text: string;
  reviewer_name: string | null;
  rating: number | null;
  review_date: string | null;
  source_platform: string | null;
  source_url: string;
  imported_at: string;
  profile: {
    id: string;
    display_name: string | null;
    full_name: string;
    city: string | null;
  } | null;
};

type ReviewDraft = {
  reviewText: string;
  reviewerName: string;
  rating: string;
  reviewDate: string;
  sourcePlatform: string;
  sourceUrl: string;
};

function buildDrafts(reviews: AdminImportedReview[]) {
  return reviews.reduce<Record<string, ReviewDraft>>((accumulator, review) => {
    accumulator[review.id] = {
      reviewText: review.review_text,
      reviewerName: review.reviewer_name || "",
      rating: review.rating?.toString() || "",
      reviewDate: review.review_date || "",
      sourcePlatform: review.source_platform || "",
      sourceUrl: review.source_url,
    };
    return accumulator;
  }, {});
}

export default function AdminReviewsManager({
  initialReviews,
}: {
  initialReviews: AdminImportedReview[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>(() => buildDrafts(initialReviews));
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(buildDrafts(initialReviews));
  }, [initialReviews]);

  const updateDraft = (reviewId: string, updates: Partial<ReviewDraft>) => {
    setDrafts((current) => ({
      ...current,
      [reviewId]: {
        ...current[reviewId],
        ...updates,
      },
    }));
  };

  const handleSave = async (reviewId: string) => {
    const draft = drafts[reviewId];
    setBusyId(reviewId);

    try {
      await postJson("/api/admin/reviews", {
        action: "edit",
        reviewId,
        reviewText: draft.reviewText,
        reviewerName: draft.reviewerName || null,
        rating: draft.rating ? Number(draft.rating) : null,
        reviewDate: draft.reviewDate || null,
        sourcePlatform: draft.sourcePlatform || null,
        sourceUrl: draft.sourceUrl,
      });

      toast({
        title: "Review updated",
        description: `Saved changes for ${reviewId}.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not update review",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setBusyId(reviewId);

    try {
      await postJson("/api/admin/reviews", {
        action: "delete",
        reviewId,
      });

      toast({
        title: "Review deleted",
        description: `${reviewId} was removed.`,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not delete review",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {initialReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No imported reviews found.</p>
      ) : null}

      {initialReviews.map((review) => {
        const draft = drafts[review.id];
        const profileName = review.profile?.display_name || review.profile?.full_name || "Unknown therapist";

        return (
          <article key={review.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {profileName}
                  {review.profile?.city ? ` · ${review.profile.city}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Imported {new Date(review.imported_at).toLocaleDateString()}
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={busyId === review.id}
                onClick={() => void handleDelete(review.id)}
              >
                {busyId === review.id ? "Working..." : "Delete"}
              </Button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Reviewer name"
                value={draft?.reviewerName || ""}
                onChange={(event) => updateDraft(review.id, { reviewerName: event.target.value })}
              />
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="Rating"
                value={draft?.rating || ""}
                onChange={(event) => updateDraft(review.id, { rating: event.target.value })}
              />
              <Input
                type="date"
                value={draft?.reviewDate || ""}
                onChange={(event) => updateDraft(review.id, { reviewDate: event.target.value })}
              />
              <Input
                placeholder="Source platform"
                value={draft?.sourcePlatform || ""}
                onChange={(event) => updateDraft(review.id, { sourcePlatform: event.target.value })}
              />
            </div>

            <Input
              className="mt-3"
              placeholder="Source URL"
              value={draft?.sourceUrl || ""}
              onChange={(event) => updateDraft(review.id, { sourceUrl: event.target.value })}
            />
            <Textarea
              className="mt-3 min-h-28"
              placeholder="Review text"
              value={draft?.reviewText || ""}
              onChange={(event) => updateDraft(review.id, { reviewText: event.target.value })}
            />

            <div className="mt-3">
              <Button type="button" variant="outline" size="sm" disabled={busyId === review.id} onClick={() => void handleSave(review.id)}>
                {busyId === review.id ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
