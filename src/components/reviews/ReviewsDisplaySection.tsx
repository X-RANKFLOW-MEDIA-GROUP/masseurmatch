'use client';

import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
}

interface ReviewsDisplayProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewsDisplay({
  reviews,
  averageRating,
  totalReviews,
}: ReviewsDisplayProps) {
  const safeTotalReviews = Math.max(totalReviews, 1);
  const ratingDistribution = {
    5: Math.round((reviews.filter((review) => review.rating === 5).length / safeTotalReviews) * 100),
    4: Math.round((reviews.filter((review) => review.rating === 4).length / safeTotalReviews) * 100),
    3: Math.round((reviews.filter((review) => review.rating === 3).length / safeTotalReviews) * 100),
    2: Math.round((reviews.filter((review) => review.rating === 2).length / safeTotalReviews) * 100),
    1: Math.round((reviews.filter((review) => review.rating === 1).length / safeTotalReviews) * 100),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
              <div className="mt-1 flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-sm text-slate-600">Based on {totalReviews} reviews</p>
            </div>

            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-slate-600">{rating}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${ratingDistribution[rating as keyof typeof ratingDistribution]}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-600">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.slice(0, 5).map((review) => (
          <Card key={review.id} className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{review.author_name}</p>
                    <div className="mt-1 flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${
                            index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-slate-600">{review.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const ReviewsDisplaySection = ReviewsDisplay;
