import { slugify } from "@/components/profile/profile-utils";

// Public profile URLs are built from specialty, city, display name (what visitors see),
// never the account's legal name, plus the first 8 chars of the profile id.
// Format: {specialty}-therapist-{city}-{name}-{id}
// Example: deep-tissue-therapist-new-york-john-doe-a1b2c3d4
// This maximizes SEO impact by including key search terms in the URL.
export function buildProfileSlug(
  displayName: string | null | undefined,
  profileId: string,
  city?: string | null,
  specialty?: string | null | string[]
) {
  const nameSlug = slugify(displayName) || "therapist";
  const citySlug = slugify(city);

  // Extract first specialty if array or multiple comma-separated values
  let specialtySlug = "";
  if (specialty) {
    const specialties = Array.isArray(specialty)
      ? specialty[0]
      : typeof specialty === "string"
        ? specialty.split(",")[0]
        : null;
    specialtySlug = slugify(specialties);
  }

  const idSuffix = profileId.replace(/-/g, "").slice(0, 8);

  // Build slug with specialty, city, and name for maximum SEO benefit
  // Fallback gracefully if specialty or city are missing
  if (specialtySlug && citySlug) {
    return `${specialtySlug}-therapist-${citySlug}-${nameSlug}-${idSuffix}`;
  }
  if (citySlug) {
    return `${nameSlug}-${citySlug}-${idSuffix}`;
  }
  return `${nameSlug}-${idSuffix}`;
}
