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
 *    provider controls. They do NOT reorder search results — they are what
 *    turns a listing view into an actual client contact. The point values are
 *    an illustrative self-check, not a search-ranking formula.
 *
 * 3. MasseurMatch does NOT verify professional licenses (they are
 *    self-declared — see src/app/badge-disclaimer/page.tsx). The only
 *    verification we perform is identity (Stripe Identity, a Pro/Elite
 *    feature) plus moderation review before a profile goes live.
 */

/** The real directory ordering, highest-priority first. */
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

/** Quality signals a provider controls — they win the client, not the slot. */
export interface StrengthSignal {
  key: string;
  label: string;
  /** Illustrative relative weight toward profile strength (the six sum to 100) */
  weight: number;
  blurb: string;
  action: string;
}

export const STRENGTH_SIGNALS: readonly StrengthSignal[] = [
  {
    key: "reviews",
    label: "Client reviews",
    weight: 24,
    blurb:
      "Volume and rating, both. Recent reviews count for more than old ones. We never write, sell, seed or remove reviews — they are the clearest proof a client has that other people trusted you first.",
    action: "Send existing clients your profile link and ask them to leave a review.",
  },
  {
    key: "photos",
    label: "Photo quality",
    weight: 20,
    blurb:
      "Resolution, lighting, and whether the photos are actually of you and your space. Stock images and pixelated phone shots read as a red flag. You do not need a studio — you need daylight and a steady hand.",
    action: "Three photos minimum, taken near a window, no filters.",
  },
  {
    key: "completeness",
    label: "Profile completeness",
    weight: 18,
    blurb:
      "Modalities, rates, service area, availability, bio. Every empty field is a question a client has to ask before booking — and most will not ask. They contact the therapist who already answered.",
    action: "Fill every field. It is the cheapest edge you will ever get, and it costs nothing.",
  },
  {
    key: "identity",
    label: "Verified identity",
    weight: 16,
    blurb:
      "Pro and Elite profiles can verify their identity through Stripe Identity, shown with a public verification date, and every profile is reviewed by our moderation team before going live. Note: we do not independently verify professional licenses — those are self-declared, and clients can confirm them with the state board.",
    action: "Verify your identity (Pro and up) and keep your self-declared credentials accurate.",
  },
  {
    key: "response",
    label: "Response time",
    weight: 12,
    blurb:
      "How fast you reply to a first message. Clients booking a massage are usually booking for this week, and a two-day reply is a lost client for both of us.",
    action: "Turn on notifications and reply — even when the reply is no.",
  },
  {
    key: "activity",
    label: "Recent activity",
    weight: 10,
    blurb:
      "Whether you have logged in, updated availability or replied lately. A stale profile with month-old availability wastes a client's time and rarely earns the contact.",
    action: "Keep your availability current. That is the whole requirement.",
  },
] as const;

/** Maximum profile-strength value — the six signals sum to this. */
export const MAX_STRENGTH = STRENGTH_SIGNALS.reduce((sum, s) => sum + s.weight, 0);
