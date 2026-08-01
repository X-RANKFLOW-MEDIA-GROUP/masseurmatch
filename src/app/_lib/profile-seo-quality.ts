type ProfileLike = Record<string, unknown>;

export type ProfileSeoQuality = {
  score: number;
  indexEligible: boolean;
  completedChecks: string[];
  missingChecks: string[];
};

const MIN_INDEX_SCORE = 70;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function truthy(value: unknown) {
  return value === true || (typeof value === "number" && value > 0) || text(value).length > 0;
}

export function evaluateProfileSeoQuality(profile: ProfileLike): ProfileSeoQuality {
  const checks = [
    {
      label: "Add an original bio of at least 150 words",
      weight: 20,
      passed: text(profile.bio).split(/\s+/).filter(Boolean).length >= 150,
    },
    {
      label: "Add a unique profile headline",
      weight: 10,
      passed: text(profile.headline).length >= 20,
    },
    {
      label: "Add city and state",
      weight: 10,
      passed: Boolean(text(profile.city) && (text(profile.state) || text(profile.state_code))),
    },
    {
      label: "Add at least three real profile photos",
      weight: 15,
      passed:
        list(profile.gallery_photos).length + list(profile.gallery_images).length >= 2 &&
        Boolean(text(profile.profile_photo) || text(profile.profile_photo_url) || text(profile.avatar_url)),
    },
    {
      label: "List at least three services or specialties",
      weight: 15,
      passed:
        new Set([
          ...list(profile.services),
          ...list(profile.service_categories),
          ...list(profile.specialties),
          ...list(profile.massage_techniques),
        ]).size >= 3,
    },
    {
      label: "Add incall, outcall, or service-area details",
      weight: 10,
      passed:
        truthy(profile.incall_price) ||
        truthy(profile.outcall_price) ||
        truthy(profile.incall_available) ||
        truthy(profile.outcall_available) ||
        list(profile.areas_served).length > 0 ||
        list(profile.service_areas).length > 0,
    },
    {
      label: "Add rates or session details",
      weight: 10,
      passed:
        truthy(profile.starting_price) ||
        truthy(profile.incall_price) ||
        truthy(profile.outcall_price) ||
        list(profile.pricing_sessions).length > 0,
    },
    {
      label: "Add current availability or business hours",
      weight: 5,
      passed:
        truthy(profile.available_now) ||
        list(profile.availability_days).length > 0 ||
        Boolean(profile.business_hours && typeof profile.business_hours === "object"),
    },
    {
      label: "Add a trust signal or verification detail",
      weight: 5,
      passed:
        truthy(profile.is_verified_identity) ||
        truthy(profile.is_verified_profile) ||
        text(profile.verification_status) === "verified" ||
        list(profile.training).length > 0 ||
        list(profile.education).length > 0,
    },
  ];

  const score = checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
  const hasIdentity = Boolean(text(profile.display_name) || text(profile.full_name) || text(profile.name));
  const hasContact = Boolean(text(profile.phone) || text(profile.email_address) || text(profile.whatsapp_number));
  const indexEligible = score >= MIN_INDEX_SCORE && hasIdentity && hasContact;

  return {
    score,
    indexEligible,
    completedChecks: checks.filter((check) => check.passed).map((check) => check.label),
    missingChecks: checks.filter((check) => !check.passed).map((check) => check.label),
  };
}

export const PROFILE_INDEX_MIN_SCORE = MIN_INDEX_SCORE;
