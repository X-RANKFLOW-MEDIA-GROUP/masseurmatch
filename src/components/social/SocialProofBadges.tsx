'use client';

import { Star, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SocialProofBadgesProps {
  isTopRated: boolean;
  isMostReviewed: boolean;
  isRising: boolean;
  reviewCount: number;
  averageRating: number;
  viewCount: number;
}

export function SocialProofBadges({
  isTopRated,
  isMostReviewed,
  isRising,
  reviewCount,
  averageRating,
  viewCount
}: SocialProofBadgesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Rating Badge */}
      {isTopRated && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-yellow-900 uppercase">Top Rated</p>
              <p className="text-sm text-yellow-800">{averageRating.toFixed(1)} stars</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Reviewed Badge */}
      {isMostReviewed && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase">Most Reviewed</p>
              <p className="text-sm text-emerald-800">{reviewCount} reviews</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rising Star Badge */}
      {isRising && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-900 uppercase">Rising Star</p>
              <p className="text-sm text-orange-800">{viewCount} views</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
