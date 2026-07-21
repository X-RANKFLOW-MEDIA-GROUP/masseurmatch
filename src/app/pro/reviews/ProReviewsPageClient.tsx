"use client";

import { useCallback, useEffect, useState } from "react";
import { AppButton, AppInput, PageSection, Surface } from "@/app/_components/primitives";
import { deleteJson, postJson, requestJson } from "@/app/_lib/client-api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  REVIEW_SOURCE_PLATFORMS,
  type ProImportedReview,
  type ProMigrationRequest,
  type ReviewSourcePlatform,
} from "@/lib/imported-reviews";
import {
  AlertCircle,
  BadgeCheck,
  Clock,
  ExternalLink,
  Link2,
  Loader2,
  Send,
  Star,
  Trash2,
} from "lucide-react";

type ReviewsResponse = {
  ok: boolean;
  requests: ProMigrationRequest[];
  reviews: ProImportedReview[];
};

const STATUS_LABELS: Record<ProMigrationRequest["status"], { label: string; tone: string }> = {
  manual_review: { label: "In queue", tone: "border-amber-300 bg-amber-50 text-amber-800" },
  pending: { label: "In queue", tone: "border-amber-300 bg-amber-50 text-amber-800" },
  in_progress: { label: "Importing", tone: "border-blue-300 bg-blue-50 text-blue-800" },
  completed: { label: "Completed", tone: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  failed: { label: "Needs attention", tone: "border-red-300 bg-red-50 text-red-800" },
};

export default function ProReviewsPageClient() {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<ReviewSourcePlatform>(REVIEW_SOURCE_PLATFORMS[0]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ProMigrationRequest[]>([]);
  const [reviews, setReviews] = useState<ProImportedReview[]>([]);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await requestJson<ReviewsResponse>("/api/pro/reviews");
      setRequests(response.requests);
      setReviews(response.reviews);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await postJson("/api/pro/reviews", { platform, sourceUrl: sourceUrl.trim() });
      setSourceUrl("");
      toast({
        title: "Link received",
        description:
          "Our team will import your reviews by hand and email you when they're live. This usually takes 1–2 business days.",
      });
      void loadData();
    } catch (error) {
      toast({
        title: "Could not submit link",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onCancelRequest = async (requestId: string) => {
    setBusyRequestId(requestId);
    try {
      await deleteJson("/api/pro/reviews", { requestId });
      toast({ title: "Request withdrawn" });
      void loadData();
    } catch (error) {
      toast({
        title: "Could not withdraw request",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setBusyRequestId(null);
    }
  };

  const publishedCount = reviews.filter((review) => review.is_public).length;
  const pendingCount = reviews.length - publishedCount;

  return (
    <div className="container mx-auto px-4 py-10">
      <PageSection
        title="Import your reviews"
        description="Already earned reviews on another platform? Send us the link to your profile there — our team transcribes them by hand and publishes them on your MasseurMatch profile, clearly labeled with their source."
      />

      <Surface className="mt-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[220px_1fr_auto]">
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value as ReviewSourcePlatform)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Platform"
            >
              {REVIEW_SOURCE_PLATFORMS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="relative">
              <Link2
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.25}
              />
              <AppInput
                type="url"
                required
                placeholder="https://... link to your profile on that platform"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                className="pl-9"
                disabled={submitting}
              />
            </div>
            <AppButton type="submit" disabled={submitting || !sourceUrl.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2.25} />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" strokeWidth={2.25} />
                  Submit link
                </>
              )}
            </AppButton>
          </div>
          <p className="text-xs text-muted-foreground">
            The profile must be publicly visible so our team can verify each review before it goes
            live. Imported reviews always display the platform they came from.
          </p>
        </form>
      </Surface>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={2} />
          <p className="text-sm text-muted-foreground">Loading your import requests...</p>
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={2} />
          <p className="text-sm text-muted-foreground">Could not load requests: {loadError}</p>
          <AppButton type="button" variant="outline" size="sm" onClick={() => void loadData()}>
            Retry
          </AppButton>
        </div>
      ) : (
        <>
          {requests.length > 0 && (
            <Surface className="mt-6">
              <h2 className="text-lg font-semibold text-foreground">Import requests</h2>
              <ul className="mt-4 divide-y divide-border">
                {requests.map((request) => {
                  const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.pending;
                  const canWithdraw =
                    request.status === "pending" || request.status === "manual_review";
                  return (
                    <li key={request.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {request.platform}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${status.tone}`}>
                            {status.label}
                          </Badge>
                          {typeof request.imported_review_count === "number" &&
                            request.imported_review_count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {request.imported_review_count} review
                                {request.imported_review_count === 1 ? "" : "s"} imported
                              </span>
                            )}
                        </div>
                        <a
                          href={request.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
                        >
                          <span className="truncate">{request.source_url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={2.25} />
                        </a>
                      </div>
                      {canWithdraw && (
                        <AppButton
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          disabled={busyRequestId === request.id}
                          onClick={() => void onCancelRequest(request.id)}
                          aria-label="Withdraw request"
                        >
                          {busyRequestId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                          ) : (
                            <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                          )}
                        </AppButton>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Surface>
          )}

          {reviews.length > 0 && (
            <Surface className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Imported reviews ({reviews.length})
                </h2>
                <p className="text-xs text-muted-foreground">
                  {publishedCount} live · {pendingCount} awaiting approval
                </p>
              </div>
              <ul className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {review.reviewer_name && (
                        <span className="text-sm font-medium text-foreground">
                          {review.reviewer_name}
                        </span>
                      )}
                      {typeof review.rating === "number" && (
                        <span className="inline-flex items-center gap-1 text-xs text-foreground">
                          <Star
                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                            strokeWidth={0}
                          />
                          {review.rating}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {review.source_platform || "Imported"}
                      </Badge>
                      {review.is_public ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-800"
                        >
                          <BadgeCheck className="mr-1 h-3 w-3" strokeWidth={2.5} />
                          Live
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-300 bg-amber-50 text-[10px] text-amber-800"
                        >
                          <Clock className="mr-1 h-3 w-3" strokeWidth={2.5} />
                          Awaiting approval
                        </Badge>
                      )}
                      {review.review_date && (
                        <span className="text-[11px] text-muted-foreground">
                          {review.review_date}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {review.review_text}
                    </p>
                  </li>
                ))}
              </ul>
            </Surface>
          )}

          {requests.length === 0 && reviews.length === 0 && (
            <div className="mt-10 flex flex-col items-center gap-2 py-8 text-center">
              <Star className="h-9 w-9 text-muted-foreground/40" strokeWidth={1.75} />
              <p className="text-sm font-medium text-foreground">No imported reviews yet</p>
              <p className="max-w-md text-xs text-muted-foreground">
                Submit the link to your profile on another platform above and our team will bring
                your reviews over for you.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
