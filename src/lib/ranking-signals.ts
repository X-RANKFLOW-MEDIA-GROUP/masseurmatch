/**
 * Data for the public /how-ranking-works page.
 *
 * HONESTY CONTRACT — this page must match what the code actually does:
 *
 * 1. PLACEMENT (where a profile appears in the directory) is set, in this
 *    order, by: subscription tier → Available Now → featured status. See
 *    `sortPublicTherapists` in src/app/_lib/directory.ts and the search API
 *    default ordering in src/app/api/search/therapists/route.ts. A paid plan
 *    is the primary lever — do not claim otherwise.
 *
 * 2. PROFILE STRENGTH (below) is a separate idea: the quality signals a
 *    provider controls. They do NOT reorder search results — they are an
 *    illustrative self-check for a clearer, more useful directory listing.
 *
 * 3. MasseurMatch does NOT independently verify professional licenses,
 *    certifications, background history, qualifications, or services. The
 *    Identity Verified badge is limited to identity evidence review. Profile
 *    moderation is separate and required before publication.
 */

export interface PlacementFactor {
  key: string;
  label: string;
  note: string;
}

export const PLACEMENT_FACTORS: readonly PlacementFactor[] = [
  {
    key: "plan",
    label: "Your plan",
    note: "The primary sort key. Elite, Pro and Standard profiles place above Free ones — this is the visibility a paid plan buys, and we are upfront about it.",
  },
  {
    key: "available",
    label: "Available Now",
    note: "Within the same plan tier, a profile that is actively available right now is lifted above one that is not.",
  },
  {
    key: "featured",
    label: "Featured status",
    note: "The final tiebreaker within a tier. Featured profiles rise above non-featured ones at the same availability.",
  },
] as const;

export interface StrengthSignal {
  key: string;
  label: string;
  weight: number;
  blurb: string;
  action: string;
}

export const STRENGTH_SIGNALS: readonly StrengthSignal[] = [
  {
    key: "clarity",
    label: "Listing clarity",
    weight: 24,
    blurb:
      "A clear headline, professional description, visible rates, and accurate service details reduce uncertainty before a client decides whether to contact you.",
    action: "Make the first screen of your profile answer who you are, what you offer, where you serve, and how to contact you.",
  },
  {
    key: "photos",
    label: "Photo quality",
    weight: 20,
    blurb:
      "Resolution, lighting, and professional presentation matter. Stock images, misleading images, and low-quality uploads weaken trust and may fail moderation.",
    action: "Use clear, recent, professional photos that accurately represent you and your practice.",
  },
  {
    key: "completeness",
    label: "Profile completeness",
    weight: 18,
    blurb:
      "Modalities, rates, service area, availability, bio, and contact preferences help clients evaluate fit before reaching out.",
    action: "Complete every relevant profile field and keep the information current.",
  },
  {
    key: "identity",
    label: "Verified identity",
    weight: 16,
    blurb:
      "Identity Verified means MasseurMatch reviewed supported government-issued identity evidence and a current challenge selfie. It does not verify professional licensing, background history, qualifications, or services.",
    action: "Complete identity verification when eligible and keep all self-declared professional information accurate.",
  },
  {
    key: "contact",
    label: "Contact readiness",
    weight: 12,
    blurb:
      "Accurate contact methods and availability make it easier for clients to reach you directly. MasseurMatch is a directory and does not manage appointments between clients and providers.",
    action: "Keep your phone, messaging options, and availability information current.",
  },
  {
    key: "activity",
    label: "Recent activity",
    weight: 10,
    blurb:
      "Regularly updated profile details and availability reduce stale information and make the directory more useful to clients.",
    action: "Review your listing regularly and update anything that has changed.",
  },
] as const;

export const MAX_STRENGTH = STRENGTH_SIGNALS.reduce((sum, s) => sum + s.weight, 0);
