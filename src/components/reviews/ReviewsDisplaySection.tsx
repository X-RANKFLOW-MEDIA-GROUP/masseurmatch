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
  totalReviews
}: ReviewsDisplayProps) {
  const ratingDistribution = {
    5: Math.round((reviews.filter(r => r.rating === 5).length / totalReviews) * 100),
    4: Math.round((reviews.filter(r => r.rating === 4).length / totalReviews) * 100),
    3: Math.round((reviews.filter(r => r.rating === 3).length / totalReviews) * 100),
    2: Math.round((reviews.filter(r => r.rating === 2).length / totalReviews) * 100),
    1: Math.round((reviews.filter(r => r.rating === 1).length / totalReviews) * 100),
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Client Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Rating */}
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-bold text-slate-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${ratingDistribution[rating as keyof typeof ratingDistribution]}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-8 text-right">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.slice(0, 5).map(review => (
          <Card key={review.id} className="border-slate-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{review.author_name}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-slate-600 text-sm">{review.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
