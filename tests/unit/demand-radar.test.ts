import { describe, expect, it } from "vitest";

import {
  getDemandFreshness,
  getDemandLabel,
  getOpportunityScore,
  rankDemandRecords,
  type DemandScoreRecord,
} from "@/lib/demand-radar";

const base: DemandScoreRecord = {
  id: "1",
  city: "Dallas",
  state: "TX",
  neighborhood: null,
  score: 80,
  trend: "rising",
  search_volume_index: 82,
  competition_index: 50,
  confidence: 80,
  source: "test",
  week_start: "2026-08-03",
  collected_at: "2026-08-06T12:00:00.000Z",
  expires_at: null,
};

describe("demand radar helpers", () => {
  it("classifies freshness windows", () => {
    const now = new Date("2026-08-06T17:00:00.000Z");
    expect(getDemandFreshness("2026-08-06T12:00:00.000Z", now)).toBe("fresh");
    expect(getDemandFreshness("2026-08-02T12:00:00.000Z", now)).toBe("delayed");
    expect(getDemandFreshness("2026-07-20T12:00:00.000Z", now)).toBe("stale");
    expect(getDemandFreshness(null, now)).toBe("unknown");
  });

  it("calculates an opportunity score from demand, competition, and confidence", () => {
    expect(getOpportunityScore(base)).toBe(74);
  });

  it("ranks lower competition above equal demand", () => {
    const lowerCompetition = { ...base, id: "2", competition_index: 20 };
    expect(rankDemandRecords([base, lowerCompetition])[0]?.id).toBe("2");
  });

  it("returns plain-language demand labels", () => {
    expect(getDemandLabel(90)).toBe("Very high");
    expect(getDemandLabel(75)).toBe("High");
    expect(getDemandLabel(55)).toBe("Moderate");
    expect(getDemandLabel(30)).toBe("Low");
  });
});
