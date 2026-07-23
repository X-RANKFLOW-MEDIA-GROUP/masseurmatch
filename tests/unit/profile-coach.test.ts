import { describe, expect, it } from "vitest";

import {
  buildCoachAnalysis,
  quickProfileScore,
  type CoachProfile,
} from "@/lib/ai/profile-coach";

function profile(overrides: Partial<CoachProfile> = {}): CoachProfile {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    display_name: "Jordan Kai",
    full_name: "Jordan Kai",
    headline: "Deep Tissue & Sports Massage in Dallas",
    tagline: "Personalized bodywork for recovery and relaxation",
    bio: "I offer professional, personalized massage sessions focused on comfort, recovery, and relaxation. Every session is adapted to the client's preferred pressure, focus areas, and goals. My approach combines clear communication, a welcoming environment, and careful attention to the details that make a session feel comfortable and effective. Clients can review services, rates, availability, and contact options directly through the profile. I value trust, professionalism, inclusion, and a calm experience from the first message through the end of the session. My work may include deep tissue, sports-focused techniques, and relaxation methods depending on the client's needs and preferences.",
    city: "Dallas",
    state: "TX",
    neighborhood: "Oak Lawn",
    slug: "jordan-kai",
    photo_url: null,
    avatar_url: null,
    massage_techniques: ["Deep Tissue", "Sports", "Swedish"],
    modalities: [],
    specialties: ["Recovery"],
    service_categories: [],
    languages: ["English"],
    languages_spoken: [],
    years_experience: 6,
    offers_incall: true,
    offers_outcall: true,
    incall: true,
    outcall: true,
    starting_price: 140,
    starting_rate: 140,
    incall_price: 140,
    outcall_price: 170,
    pricing_sessions: [{ minutes: 60, incall_rate: 140 }],
    rates: null,
    session_lengths: [60, 90],
    incall_amenities: ["Free parking", "Shower"],
    studio_amenities: [],
    payment_methods: ["Cash", "Zelle"],
    areas_served: ["Dallas", "Uptown"],
    travel_schedule: [],
    business_trips: [],
    education_entries: [{ institution: "Example School" }],
    certifications: "Continuing education",
    training: null,
    is_verified_phone: true,
    is_verified_email: true,
    is_verified_identity: true,
    is_verified_profile: true,
    is_verified_photos: true,
    lgbtq_affirming: true,
    accepts_all_genders: true,
    available_now: true,
    is_featured: false,
    seo_title: "Deep Tissue Massage in Dallas | Jordan Kai",
    seo_description: "Professional deep tissue and sports massage sessions in Dallas with direct contact, rates, and availability.",
    seo_keywords: ["deep tissue massage Dallas", "sports massage Dallas"],
    review_count: 8,
    average_rating: 4.9,
    subscription_tier: "pro",
    visibility_status: "public",
    profile_status: "approved",
    ...overrides,
  };
}

describe("AI Profile Coach scoring", () => {
  it("scores complete profiles higher than incomplete profiles", () => {
    const complete = quickProfileScore(profile(), 5);
    const incomplete = quickProfileScore(profile({
      headline: null,
      tagline: null,
      bio: null,
      massage_techniques: [],
      modalities: [],
      languages: [],
      city: null,
      state: null,
      starting_price: null,
      starting_rate: null,
      incall_price: null,
      is_verified_identity: false,
      is_verified_phone: false,
      is_verified_email: false,
      available_now: false,
    }), 0);

    expect(complete).toBeGreaterThan(incomplete);
    expect(complete).toBeGreaterThanOrEqual(80);
    expect(incomplete).toBeLessThan(40);
  });

  it("builds recommendations, forecasts, and anonymized competitor benchmarks", () => {
    const analysis = buildCoachAnalysis({
      profile: profile({ headline: null, seo_title: null, seo_description: null }),
      photos: [
        { id: "photo-1", url: "https://example.com/1.jpg", storage_path: null, is_primary: true, moderation_status: "approved", sort_order: 0 },
      ],
      photoScores: [],
      snapshots: [
        { snapshot_date: "2026-07-21", profile_score: 70, visibility_score: 68, trust_score: 80, content_score: 65, conversion_score: 72 },
        { snapshot_date: "2026-07-22", profile_score: 74, visibility_score: 72, trust_score: 82, content_score: 70, conversion_score: 74 },
      ],
      rankings: [
        { position_in_results: 12, created_at: "2026-07-22T10:00:00Z" },
        { position_in_results: 9, created_at: "2026-07-23T10:00:00Z" },
      ],
      keywords: [
        { keyword: "deep tissue massage Dallas", score: 92, trend_direction: "up", week_over_week_change: 18 },
      ],
      market: { score: 88, trend: "up", competition_index: 63, search_volume_index: 81 },
      metrics: {
        views1d: 12,
        views7d: 70,
        views30d: 240,
        contacts1d: 2,
        contacts7d: 9,
        contacts30d: 28,
        favorites7d: 5,
        inquiries7d: 3,
      },
      competitorScores: [94, 91, 88, 84, 79, 72],
    });

    expect(analysis.recommendations[0]?.key).toBe("headline");
    expect(analysis.forecast.contactsHigh).toBeGreaterThanOrEqual(analysis.forecast.contactsLikely);
    expect(analysis.metrics.contactRate).toBeCloseTo(12.9, 1);
    expect(analysis.ranking.change).toBe(3);
    expect(analysis.market.topKeywords[0]?.keyword).toBe("deep tissue massage Dallas");
    expect(analysis.benchmark.cityProfileCount).toBe(6);
    expect(analysis.history).toHaveLength(2);
  });
});
