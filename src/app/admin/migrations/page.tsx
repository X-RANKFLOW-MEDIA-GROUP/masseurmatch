"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, Loader2, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportedReview {
  id: string;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string;
  review_date: string | null;
  source_platform: string | null;
  is_public: boolean;
  reviewed_at?: string | null;
  review_notes?: string | null;
}

interface Migration {
  id: string;
  email: string;
  platform: string;
  imported_review_count: number;
  is_verified: boolean;
  status: string;
  source_url?: string;
  reviews?: ImportedReview[];
}

export default function AdminMigrationsPage() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [approvalStatus, setApprovalStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchMigrations();
  }, []);

  const fetchMigrations = async () => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/migrate/review", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load migrations (${res.status})`);
      const data = (await res.json()) as { migrations?: Migration[] };
      setMigrations(data.migrations ?? []);
    } catch (error) {
      console.error("Error fetching migrations:", error);
      setErrorMessage("Could not load profile imports.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMig = migrations.find((migration) => migration.id === selectedMigration) ?? null;
  const pendingReviews = useMemo(
    () => selectedMig?.reviews?.filter((review) => !review.reviewed_at) ?? [],
    [selectedMig],
  );
  const reviewedReviews = useMemo(
    () => selectedMig?.reviews?.filter((review) => Boolean(review.reviewed_at)) ?? [],
    [selectedMig],
  );

  const openMigration = (migration: Migration) => {
    setSelectedMigration(migration.id);
    setApprovalStatus({});
    setReviewNotes({});
    setErrorMessage(null);
  };

  const decideAllPending = (approved: boolean) => {
    setApprovalStatus((current) => {
      const next = { ...current };
      pendingReviews.forEach((review) => {
        next[review.id] = approved;
      });
      return next;
    });
  };

  const handlePublishDecisions = async () => {
    if (!selectedMig || pendingReviews.length === 0) return;

    const undecided = pendingReviews.filter((review) => approvalStatus[review.id] === undefined);
    if (undecided.length > 0) {
      setErrorMessage(`Review every pending testimonial first (${undecided.length} remaining).`);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/migrate/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          migrationId: selectedMig.id,
          reviews: pendingReviews.map((review) => ({
            reviewId: review.id,
            approved: approvalStatus[review.id],
            notes: reviewNotes[review.id] || "",
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to save review decisions");
      }

      await fetchMigrations();
      setApprovalStatus({});
      setReviewNotes({});
    } catch (error) {
      console.error("Error saving migration review decisions:", error);
      setErrorMessage(error instanceof Error ? error.message : "Could not save review decisions.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B1E2D]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Import Profiles</h1>
          <p className="text-[#6F6F6F]">Review imported testimonials before they are published.</p>
        </div>
        <Button variant="outline" onClick={() => void fetchMigrations()}>
          Refresh
        </Button>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {migrations.length === 0 ? (
          <div className="col-span-full rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] p-8 text-center">
            <p className="text-[#6F6F6F]">No profile imports found.</p>
          </div>
        ) : (
          migrations.map((migration) => {
            const pendingCount = migration.reviews?.filter((review) => !review.reviewed_at).length ?? 0;
            const liveCount = migration.reviews?.filter((review) => review.is_public).length ?? 0;
            return (
              <Card
                key={migration.id}
                className="cursor-pointer border-[#E8E8E8] transition-colors hover:border-[#8B1E2D]"
                onClick={() => openMigration(migration)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">{migration.email}</CardTitle>
                      <p className="text-sm capitalize text-[#8E8E8E]">{migration.platform}</p>
                    </div>
                    {pendingCount > 0 ? (
                      <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800">
                        {pendingCount} pending
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Reviewed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-[#6F6F6F]">
                  <p>{migration.imported_review_count ?? 0} imported testimonials</p>
                  <p>{liveCount} currently public</p>
                  <p className="capitalize">Migration: {migration.status.replaceAll("_", " ")}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {selectedMig ? (
        <Card className="border-[#D9D9D9] bg-white">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>{selectedMig.email}</CardTitle>
                <p className="text-sm capitalize text-[#6F6F6F]">{selectedMig.platform}</p>
                {selectedMig.source_url ? (
                  <a
                    href={selectedMig.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-[#8B1E2D] hover:underline"
                  >
                    Open source profile
                  </a>
                ) : null}
              </div>
              <Button variant="outline" onClick={() => setSelectedMigration(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111111]">Pending publication review</h2>
                  <p className="text-sm text-[#6F6F6F]">
                    Approve publishes the testimonial. Reject keeps it private.
                  </p>
                </div>
                {pendingReviews.length > 0 ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => decideAllPending(true)}>
                      Approve all
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => decideAllPending(false)}>
                      Reject all
                    </Button>
                  </div>
                ) : null}
              </div>

              {pendingReviews.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviews.map((review) => {
                    const decision = approvalStatus[review.id];
                    return (
                      <div key={review.id} className="rounded-xl border border-[#E8E8E8] p-4">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#111111]">{review.reviewer_name || "Imported client"}</p>
                            <div className="mt-1 flex items-center gap-2">
                              {review.rating ? (
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-4 w-4 ${
                                        index < Math.round(review.rating ?? 0)
                                          ? "fill-[#8B1E2D] text-[#8B1E2D]"
                                          : "text-[#D9D9D9]"
                                      }`}
                                    />
                                  ))}
                                </div>
                              ) : null}
                              {review.review_date ? (
                                <span className="text-xs text-[#8E8E8E]">
                                  {new Date(`${review.review_date}T00:00:00`).toLocaleDateString()}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              aria-label="Approve testimonial"
                              onClick={() => setApprovalStatus((current) => ({ ...current, [review.id]: true }))}
                              className={`rounded-lg border p-2 transition-colors ${
                                decision === true
                                  ? "border-green-300 bg-green-100 text-green-700"
                                  : "border-[#E4E4E4] bg-white text-[#8E8E8E] hover:bg-green-50 hover:text-green-700"
                              }`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Reject testimonial"
                              onClick={() => setApprovalStatus((current) => ({ ...current, [review.id]: false }))}
                              className={`rounded-lg border p-2 transition-colors ${
                                decision === false
                                  ? "border-red-300 bg-red-100 text-red-700"
                                  : "border-[#E4E4E4] bg-white text-[#8E8E8E] hover:bg-red-50 hover:text-red-700"
                              }`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-[#55504D]">{review.review_text}</p>
                        <textarea
                          placeholder="Admin notes (optional)"
                          value={reviewNotes[review.id] || ""}
                          onChange={(event) =>
                            setReviewNotes((current) => ({ ...current, [review.id]: event.target.value }))
                          }
                          className="mt-4 w-full rounded-lg border border-[#D9D9D9] p-2 text-sm text-[#111111] placeholder-[#8E8E8E] focus:border-[#8B1E2D] focus:outline-none"
                          rows={2}
                        />
                      </div>
                    );
                  })}

                  <Button
                    onClick={() => void handlePublishDecisions()}
                    disabled={isSaving}
                    className="w-full bg-[#8B1E2D] hover:bg-[#6E1521]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save decisions & publish approved
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  No testimonials are waiting for review.
                </div>
              )}
            </section>

            {reviewedReviews.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-[#111111]">Reviewed testimonials</h2>
                <div className="space-y-3">
                  {reviewedReviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="font-semibold text-[#111111]">{review.reviewer_name || "Imported client"}</p>
                        <Badge
                          variant="outline"
                          className={
                            review.is_public
                              ? "border-green-300 bg-green-50 text-green-700"
                              : "border-slate-300 bg-white text-slate-600"
                          }
                        >
                          {review.is_public ? (
                            <><Eye className="mr-1 h-3 w-3" /> Public</>
                          ) : (
                            <><EyeOff className="mr-1 h-3 w-3" /> Private</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-[#625C58]">{review.review_text}</p>
                      {review.review_notes ? (
                        <p className="mt-2 text-xs text-[#8E8E8E]">Admin note: {review.review_notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
