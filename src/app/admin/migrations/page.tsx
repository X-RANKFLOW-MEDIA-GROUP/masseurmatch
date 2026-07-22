"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Loader2, AlertCircle, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/app/_lib/client-api";
import { useToast } from "@/hooks/use-toast";

interface ImportedReview {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  source_platform: string;
  is_public: boolean;
}

interface Migration {
  id: string;
  email: string;
  platform: string;
  source_url?: string;
  imported_review_count: number;
  is_verified: boolean;
  status: string;
  reviews?: ImportedReview[];
}

type NewReviewDraft = {
  reviewerName: string;
  rating: string;
  reviewDate: string;
  reviewText: string;
};

const EMPTY_DRAFT: NewReviewDraft = {
  reviewerName: "",
  rating: "",
  reviewDate: "",
  reviewText: "",
};

export default function AdminMigrationsPage() {
  const { toast } = useToast();
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [approvalStatus, setApprovalStatus] = useState<Record<string, boolean>>({});
  const [newReview, setNewReview] = useState<NewReviewDraft>(EMPTY_DRAFT);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    try {
      const res = await fetch("/api/migrate/review");
      if (!res.ok) {
        throw new Error(`Failed to load migrations (${res.status})`);
      }
      const data = (await res.json()) as { migrations?: Migration[] };
      setMigrations(data.migrations ?? []);
    } catch (error) {
      console.error("Error fetching migrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (migrationId: string) => {
    setIsApproving(true);
    try {
      const migration = migrations.find((m) => m.id === migrationId);
      if (!migration) return;

      const reviewsToApprove = migration.reviews
        ?.filter((r) => approvalStatus[r.id] !== false)
        .map((r) => ({
          reviewId: r.id,
          approved: approvalStatus[r.id] !== false,
          notes: reviewNotes[r.id] || "",
        })) || [];

      const res = await fetch("/api/migrate/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          migrationId,
          reviews: reviewsToApprove,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve migration");
      }

      // Refresh migrations
      fetchMigrations();
      setSelectedMigration(null);
      setReviewNotes({});
      setApprovalStatus({});
    } catch (error) {
      console.error("Error approving migration:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleAddReview = async (migrationId: string, publish: boolean) => {
    if (!newReview.reviewText.trim()) return;
    setIsAdding(true);
    try {
      await postJson("/api/admin/reviews", {
        action: "add",
        migrationId,
        reviewText: newReview.reviewText.trim(),
        reviewerName: newReview.reviewerName.trim() || null,
        rating: newReview.rating ? Number(newReview.rating) : null,
        reviewDate: newReview.reviewDate || null,
        publish,
      });
      toast({
        title: publish ? "Review added and published" : "Review added",
        description: publish
          ? "It is now live on the therapist's profile."
          : "It is waiting in the approval list below.",
      });
      setNewReview(EMPTY_DRAFT);
      await fetchMigrations();
    } catch (error) {
      toast({
        title: "Could not add review",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B1E2D]" />
      </div>
    );
  }

  const selectedMig = migrations.find((m) => m.id === selectedMigration);

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold text-[#111111]">Profile Migrations</h1>
        <p className="text-[#6F6F6F]">Review and approve imported profiles and reviews</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {migrations.length === 0 ? (
          <div className="col-span-full rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-8 text-center">
            <p className="text-[#6F6F6F]">No migrations to review</p>
          </div>
        ) : (
          migrations.map((migration) => (
            <Card
              key={migration.id}
              className="cursor-pointer border-[#E8E8E8] hover:border-[#8B1E2D]"
              onClick={() => setSelectedMigration(migration.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{migration.email}</CardTitle>
                    <p className="text-sm text-[#8E8E8E]">{migration.platform}</p>
                  </div>
                  {migration.is_verified ? (
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-yellow-800">
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6F6F6F]">{migration.imported_review_count} reviews to review</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedMig && (
        <Card className="border-[#D9D9D9] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedMig.email}</CardTitle>
                <p className="text-sm text-[#6F6F6F]">{selectedMig.platform}</p>
                {selectedMig.source_url && (
                  <a
                    href={selectedMig.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[#8B1E2D] hover:underline"
                  >
                    Open source profile
                    <ExternalLink className="h-3 w-3" strokeWidth={2.25} />
                  </a>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedMigration(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Manual entry: transcribe reviews from the source profile by hand */}
            <div className="rounded-lg border border-dashed border-[#D9D9D9] bg-[#FAFAFA] p-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#111111]">
                <Plus className="h-4 w-4 text-[#8B1E2D]" strokeWidth={2.5} />
                Add review manually
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Reviewer name"
                  value={newReview.reviewerName}
                  onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                  disabled={isAdding}
                />
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  placeholder="Rating (1–5)"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                  disabled={isAdding}
                />
                <Input
                  type="date"
                  value={newReview.reviewDate}
                  onChange={(e) => setNewReview({ ...newReview, reviewDate: e.target.value })}
                  disabled={isAdding}
                />
              </div>
              <Textarea
                className="mt-3 min-h-24 bg-white"
                placeholder="Review text (copy it exactly as written on the source profile)"
                value={newReview.reviewText}
                onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                disabled={isAdding}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="bg-[#8B1E2D] hover:bg-[#6E1521]"
                  disabled={isAdding || !newReview.reviewText.trim()}
                  onClick={() => void handleAddReview(selectedMig.id, true)}
                >
                  {isAdding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" strokeWidth={2.5} />
                  )}
                  Add & publish
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAdding || !newReview.reviewText.trim()}
                  onClick={() => void handleAddReview(selectedMig.id, false)}
                >
                  Add as pending
                </Button>
              </div>
            </div>

            {selectedMig.reviews && selectedMig.reviews.length > 0 ? (
              <div className="space-y-4">
                {selectedMig.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-[#E8E8E8] p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#111111]">{review.reviewer_name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(review.rating)
                                    ? "fill-[#8B1E2D] text-[#8B1E2D]"
                                    : "text-[#D9D9D9]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-[#8E8E8E]">{review.rating}</span>
                        </div>
                        <p className="text-xs text-[#8E8E8E]">{new Date(review.review_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setApprovalStatus({ ...approvalStatus, [review.id]: true })}
                          className={`rounded p-2 ${
                            approvalStatus[review.id] === true
                              ? "bg-green-100 text-green-600"
                              : "bg-[#FAFAFA] text-[#8E8E8E] hover:bg-green-50"
                          }`}
                        >
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setApprovalStatus({ ...approvalStatus, [review.id]: false })}
                          className={`rounded p-2 ${
                            approvalStatus[review.id] === false
                              ? "bg-red-100 text-red-600"
                              : "bg-[#FAFAFA] text-[#8E8E8E] hover:bg-red-50"
                          }`}
                        >
                          <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <p className="mb-3 text-sm text-[#6F6F6F]">{review.review_text}</p>

                    <textarea
                      placeholder="Admin notes..."
                      value={reviewNotes[review.id] || ""}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [review.id]: e.target.value })}
                      className="w-full rounded border border-[#D9D9D9] p-2 text-sm text-[#111111] placeholder-[#8E8E8E] focus:border-[#8B1E2D]"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-[#FAFAFA] p-4 text-center">
                <p className="text-[#6F6F6F]">No reviews to review</p>
              </div>
            )}

            {!selectedMig.is_verified && selectedMig.reviews && selectedMig.reviews.length > 0 && (
              <Button
                onClick={() => handleApprove(selectedMig.id)}
                disabled={isApproving}
                className="w-full bg-[#8B1E2D] hover:bg-[#6E1521]"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    Approve Migration
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
