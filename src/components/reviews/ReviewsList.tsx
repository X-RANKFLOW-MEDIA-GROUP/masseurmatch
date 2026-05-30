"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, ThumbsUp, CheckCircle2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  client?: {
    raw_user_meta_data?: {
      full_name?: string;
    };
  };
};

type RatingDistribution = {
  rating: number;
  count: number;
};

interface ReviewsListProps {
  therapistId: string;
  averageRating?: number;
  totalReviews?: number;
}

export function ReviewsList({ therapistId, averageRating = 0, totalReviews = 0 }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [distribution, setDistribution] = useState<RatingDistribution[]>([]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?therapistId=${therapistId}&page=${page}&sortBy=${sortBy}`
      );
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotalPages(data.totalPages ?? 1);
      setDistribution(data.ratingDistribution ?? []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
    setLoading(false);
  }, [page, sortBy, therapistId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function markHelpful(reviewId: string) {
    try {
      await fetch(`/api/reviews/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        )
      );
    } catch (error) {
      console.error("Failed to mark helpful:", error);
    }
  }

  const maxDistributionCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Reviews ({totalReviews})</CardTitle>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="rating-high">Highest Rating</SelectItem>
              <SelectItem value="rating-low">Lowest Rating</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="flex flex-col gap-6 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
            <div className="mt-1 flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-slate-500">{totalReviews} reviews</p>
          </div>

          <div className="flex-1 space-y-2">
            {distribution.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-8 text-sm text-slate-600">{rating} star</span>
                <Progress
                  value={(count / maxDistributionCount) * 100}
                  className="h-2 flex-1"
                />
                <span className="w-8 text-right text-sm text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <Star className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-medium text-slate-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-slate-500">Be the first to leave a review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.is_verified && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Confirmed
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="mt-2 font-semibold text-slate-900">{review.title}</h4>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>

                {review.content && (
                  <p className="mt-2 text-sm text-slate-600">{review.content}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    By {review.client?.raw_user_meta_data?.full_name ?? "Anonymous"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markHelpful(review.id)}
                    className="gap-1 text-xs"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Helpful ({review.helpful_count})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
