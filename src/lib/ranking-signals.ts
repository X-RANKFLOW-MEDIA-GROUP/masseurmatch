/**
 * Ranking policy — the six earned signals that produce a profile's score.
 *
 * IMPORTANT (honesty contract):
 * - These `weight` values are an ILLUSTRATION of relative influence, not a
 *   published exact formula. The live weighting is tuned over time. What is
 *   fixed — and what this page commits to — is that a profile's SCORE comes
 *   only from these six earned signals, and never from what a therapist pays.
 * - A plan changes VISIBILITY (which placement tier a profile appears in), not
 *   the score. Do not describe a plan as buying score anywhere on this page.
 *
 * The ledger, simulator and signal-detail list all read from this one array,
 * so the relative weights stay in sync across the page.
 */

export interface RankingSignal {
  key: string;
  /** lucide-react icon name, resolved by the consumer */
  label: string;
  /** Illustrative relative weight (the six sum to 100) */
  weight: number;
  /** What the signal measures */
  blurb: string;
  /** A concrete, free action a therapist can take */
  action: string;
}

export const RANKING_SIGNALS: readonly RankingSignal[] = [
  {
    key: "license",
    label: "Verified license",
    weight: 25,
    blurb:
      "Your license number checked against your state board. Unverified profiles are not hidden — they are simply outranked by every verified one in the same tier. It carries the most weight because it is the one thing clients cannot check for themselves.",
    action: "Enter your license number at signup. Verification is usually done within 24 hours.",
  },
  {
    key: "reviews",
    label: "Client reviews",
    weight: 22,
    blurb:
      "Volume and rating, both. Recent reviews count for more than old ones, so a therapist who was busy three years ago does not sit permanently above one who is busy now. We never sell, seed or remove reviews.",
    action: "Send existing clients your profile link and ask them to leave a review.",
  },
  {
    key: "completeness",
    label: "Profile completeness",
    weight: 18,
    blurb:
      "Modalities, rates, service area, availability, bio. Every empty field is a question a client has to ask before booking — and most will not ask. They book the therapist who already answered.",
    action: "Fill every field. It is the cheapest rank you will ever earn, and it costs nothing.",
  },
  {
    key: "photos",
    label: "Photo quality",
    weight: 15,
    blurb:
      "Resolution, lighting, and whether the photos are actually of you and your space. Stock images and pixelated phone shots score low. You do not need a studio — you need daylight and a steady hand.",
    action: "Three photos minimum, taken near a window, no filters.",
  },
  {
    key: "response",
    label: "Response time",
    weight: 12,
    blurb:
      "Median time between a client's message and your first reply. Clients booking a massage are usually booking for this week, and a two-day reply is a lost client for both of us.",
    action: "Turn on notifications and reply — even when the reply is no.",
  },
  {
    key: "activity",
    label: "Recent activity",
    weight: 8,
    blurb:
      "Whether you have logged in, updated availability or replied lately. It keeps therapists who have stopped working from occupying the top of results and wasting a client's time.",
    action: "Keep your availability current. That is the whole requirement.",
  },
] as const;

/** Maximum achievable score — the six signals sum to this. */
export const MAX_SCORE = RANKING_SIGNALS.reduce((sum, s) => sum + s.weight, 0);
