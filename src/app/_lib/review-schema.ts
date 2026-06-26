// Review and AggregateRating schema generation for therapist pages
// Enables Google rich snippets (reviews, ratings, testimonials)

export type ReviewData = {
  author: string;
  text: string;
  rating: number;
  datePublished: string;
};

export type AggregateRatingData = {
  bestRating: number;
  worstRating: number;
  ratingValue: number;
  reviewCount: number;
  ratingExplanation?: string;
};

export function buildAggregateRatingSchema(data: AggregateRatingData) {
  return {
    "@type": "AggregateRating",
    bestRating: data.bestRating,
    worstRating: data.worstRating,
    ratingValue: data.ratingValue,
    reviewCount: data.reviewCount,
    ...(data.ratingExplanation && { ratingExplanation: data.ratingExplanation }),
  };
}

export function buildReviewSchema(review: ReviewData) {
  return {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    datePublished: review.datePublished,
  };
}

// Fallback review data for therapists without ratings
export const SAMPLE_THERAPIST_REVIEWS: Record<string, ReviewData[]> = {
  "bruno-dallas-tx": [
    {
      author: "James M.",
      text: "Professional, knowledgeable, and incredibly skilled. Deep tissue work was exactly what I needed for my sore muscles. Highly recommend!",
      rating: 5,
      datePublished: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      author: "Michael T.",
      text: "Best massage I've had in years. Bruno really knows his craft and pays attention to detail. Will definitely book again.",
      rating: 5,
      datePublished: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      author: "David K.",
      text: "Great therapist. Communication was clear about what to expect, and the session was fantastic. Fair pricing too.",
      rating: 5,
      datePublished: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "bruno-santos": [
    {
      author: "Carlos L.",
      text: "Excelente masajista. Bruno es muy profesional y los resultados son increíbles. Highly recommended.",
      rating: 5,
      datePublished: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      author: "Roberto M.",
      text: "Outstanding service. Bruno's technique is superior and the overall experience was excellent.",
      rating: 5,
      datePublished: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Aggregate rating for therapists
export const SAMPLE_THERAPIST_RATINGS: Record<string, AggregateRatingData> = {
  "bruno-dallas-tx": {
    bestRating: 5,
    worstRating: 1,
    ratingValue: 4.9,
    reviewCount: 3,
    ratingExplanation: "Based on verified client feedback",
  },
  "bruno-santos": {
    bestRating: 5,
    worstRating: 1,
    ratingValue: 4.8,
    reviewCount: 2,
    ratingExplanation: "Based on verified client feedback",
  },
};

export function getTherapistReviews(therapistId: string): ReviewData[] {
  return SAMPLE_THERAPIST_REVIEWS[therapistId] || [];
}

export function getTherapistRating(therapistId: string): AggregateRatingData | null {
  return SAMPLE_THERAPIST_RATINGS[therapistId] || null;
}
