import { slugify } from "@/components/profile/profile-utils";

// Public profile URLs are built from the display name (what visitors see),
// never the account's legal name, plus the first 8 chars of the profile id
// so two providers with the same display name each keep a unique slug.
export function buildProfileSlug(displayName: string | null | undefined, profileId: string) {
  const base = slugify(displayName) || "therapist";
  return `${base}-${profileId.replace(/-/g, "").slice(0, 8)}`;
}
