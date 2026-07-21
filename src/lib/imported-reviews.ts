// Shared contract for the review-migration flow: a therapist submits the URL
// of their profile on another platform (/pro/reviews), an admin manually
// transcribes the reviews (/admin/migrations), and approved reviews render on
// the public profile. Kept outside the route files because Next.js route
// handlers may only export HTTP methods and route config.

export const REVIEW_SOURCE_PLATFORMS = [
  "RentMasseur",
  "MasseurFinder",
  "Massage Republic",
  "MassageBook",
  "Google",
  "Yelp",
  "Other",
] as const;

export type ReviewSourcePlatform = (typeof REVIEW_SOURCE_PLATFORMS)[number];

// The generated Supabase types predate these tables' current columns, so rows
// are read through these shapes after untyped queries.
export type ProMigrationRequest = {
  id: string;
  platform: string;
  source_url: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "manual_review";
  imported_review_count: number | null;
  is_verified: boolean | null;
  created_at: string;
};

export type ProImportedReview = {
  id: string;
  source_platform: string | null;
  source_url: string | null;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string;
  review_date: string | null;
  is_public: boolean;
  created_at: string | null;
};
