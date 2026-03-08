import type { Tables } from "@/integrations/supabase/types";

export interface CompletenessStep {
  key: string;
  label: string;
  description: string;
  weight: number;
  done: boolean;
  link: string;
}

export interface ProfileCompleteness {
  score: number;
  steps: CompletenessStep[];
  completedCount: number;
  totalCount: number;
  isPublishReady: boolean;
  missingRequired: CompletenessStep[];
}

/**
 * Calculates a weighted profile completeness score.
 * Required fields gate publication; optional fields improve score.
 */
export function getProfileCompleteness(
  profile: Tables<"profiles"> | null,
  photoCount: number = 0
): ProfileCompleteness {
  if (!profile) {
    return {
      score: 0,
      steps: [],
      completedCount: 0,
      totalCount: 0,
      isPublishReady: false,
      missingRequired: [],
    };
  }

  const steps: CompletenessStep[] = [
    // Required (weight 15+ each)
    {
      key: "display_name",
      label: "Add a display name",
      description: "How clients will see you in the directory",
      weight: 15,
      done: !!profile.display_name && profile.display_name.length >= 2,
      link: "/dashboard/profile",
    },
    {
      key: "bio",
      label: "Write a professional bio",
      description: "At least 50 characters describing your experience",
      weight: 15,
      done: !!profile.bio && profile.bio.length >= 50,
      link: "/dashboard/profile",
    },
    {
      key: "phone",
      label: "Add a phone number",
      description: "Required for client contact",
      weight: 15,
      done: !!profile.phone && profile.phone.length >= 7,
      link: "/dashboard/profile",
    },
    {
      key: "city",
      label: "Set your location",
      description: "Clients search by city — be discoverable",
      weight: 15,
      done: !!profile.city,
      link: "/dashboard/location",
    },
    {
      key: "photos",
      label: "Upload at least one photo",
      description: "Profiles with photos get 5x more views",
      weight: 15,
      done: photoCount > 0,
      link: "/dashboard/photos",
    },
    // Important optional (weight 5-10)
    {
      key: "pricing",
      label: "Set your pricing",
      description: "Help clients understand your rates",
      weight: 10,
      done: !!profile.incall_price || !!profile.outcall_price,
      link: "/dashboard/pricing",
    },
    {
      key: "specialties",
      label: "Add specialties",
      description: "What massage types do you offer?",
      weight: 5,
      done: Array.isArray(profile.specialties) && profile.specialties.length > 0,
      link: "/dashboard/profile",
    },
    {
      key: "verification",
      label: "Verify your identity",
      description: "Get the trusted verified badge",
      weight: 5,
      done: profile.is_verified_identity,
      link: "/dashboard/verification",
    },
    {
      key: "languages",
      label: "Add languages spoken",
      description: "Help international clients find you",
      weight: 3,
      done: Array.isArray(profile.languages) && profile.languages.length > 0,
      link: "/dashboard/profile",
    },
    {
      key: "business_hours",
      label: "Set business hours",
      description: "Let clients know when you're available",
      weight: 2,
      done: !!profile.business_hours && Object.keys(profile.business_hours as object).length > 0,
      link: "/dashboard/availability",
    },
  ];

  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);
  const earnedWeight = steps.filter((s) => s.done).reduce((sum, s) => sum + s.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);
  const completedCount = steps.filter((s) => s.done).length;

  // Required steps are the first 5 (display_name, bio, phone, city, photos)
  const requiredKeys = ["display_name", "bio", "phone", "city", "photos"];
  const missingRequired = steps.filter((s) => requiredKeys.includes(s.key) && !s.done);
  const isPublishReady = missingRequired.length === 0;

  return {
    score,
    steps,
    completedCount,
    totalCount: steps.length,
    isPublishReady,
    missingRequired,
  };
}
