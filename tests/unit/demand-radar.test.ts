import { describe, expect, it } from "vitest";

import {
  formatUsDate,
  getCompetitionSignalStatus,
  getDemandFreshness,
  getDemandLabel,
  getMarketPercentile,
  getMarketSignalStatus,
  getOpportunityScore,
  getSpikeWindow,
  rankDemandRecords,
  shouldSendSpikeAlert,
  type DemandScoreRecord,
} from "@/lib/demand-radar";

const base: DemandScoreRecord = {
  id: "1",
  city: "Dallas",
  state: "TX",
  neighborhood: null,
  score: 80,
  trend: "rising",
  spike_score: 82,
  search_volume_index: 82,
  competition_index: 50,
  confidence: 80,
  source: "test",
  week_start: "2026-08-03",
  collected_at: "2026-08-06T12:00:00.000Z",
  expires_at: null,
  run_id: "run-1",
  methodology_version: "test-v1",
  baseline_index: 60,
  growth_pct: 33,
  velocity_score: 70,
  persistence_score: 80,
  sample_size: 35,
  score_components: {},
};

describe("demand radar helpers", () => {
  it("classifies freshness windows", () => {
    const now = new Date("2026-08-06T17:00:00.000Z");
    expect(getDemandFreshness("2026-08-06T12:00:00.000Z", now)).toBe("fresh");
    expect(getDemandFreshness("2026-08-02T12:00:00.000Z", now)).toBe("delayed");
    expect(getDemandFreshness("2026-07-20T12:00:00.000Z", now)).toBe("stale");
    expect(getDemandFreshness(null, now)).toBe("unknown");
  });

  it("formats dashboard dates as MM/DD/YYYY", () => {
    expect(formatUsDate("2026-08-14")).toBe("08/14/2026");
    expect(formatUsDate("2026-08-14T10:30:00.000Z")).toBe("08/14/2026");
  });

  it("calculates an opportunity score from demand, competition, and confidence", () => {
    expect(getOpportunityScore(base)).toBe(74);
  });

  it("does not invent opportunity when competition is unknown", () => {
    expect(getOpportunityScore({ ...base, competition_index: null })).toBeNull();
  });

  it("marks flat competition as experimental", () => {
    const records = Array.from({ length: 6 }, (_, index) => ({ ...base, id: String(index), competition_index: 50 }));
    expect(getCompetitionSignalStatus(records)).toBe("experimental");
  });

  it("requires meaningful competition spread before calling it reliable", () => {
    const values = [18, 32, 47, 61, 78, 84];
    const records = values.map((competition_index, index) => ({ ...base, id: String(index), competition_index }));
    expect(getCompetitionSignalStatus(records)).toBe("reliable");
  });

  it("ranks lower competition above equal demand when competition is reliable", () => {
    const lowerCompetition = { ...base, id: "2", competition_index: 20 };
    expect(rankDemandRecords([base, lowerCompetition])[0]?.id).toBe("2");
  });

  it("can ignore experimental competition when ranking a current run", () => {
    const strongerSpike = { ...base, id: "2", score: 75, spike_score: 95, competition_index: 90 };
    expect(rankDemandRecords([base, strongerSpike], { useOpportunity: false })[0]?.id).toBe("2");
  });

  it("returns plain language demand labels", () => {
    expect(getDemandLabel(90)).toBe("Very high");
    expect(getDemandLabel(75)).toBe("High");
    expect(getDemandLabel(55)).toBe("Moderate");
    expect(getDemandLabel(30)).toBe("Low");
  });

  it("creates a clear seven day active spike window", () => {
    const window = getSpikeWindow(base);
    expect(window.status).toBe("active");
    expect(formatUsDate(window.start)).toBe("08/06/2026");
    expect(formatUsDate(window.end)).toBe("08/13/2026");
    expect(shouldSendSpikeAlert(base)).toBe(true);
    expect(getMarketSignalStatus(base)).toBe("spiking");
  });

  it("does not email normal or low confidence signals", () => {
    expect(shouldSendSpikeAlert({ ...base, spike_score: 55 })).toBe(false);
    expect(shouldSendSpikeAlert({ ...base, confidence: 30 })).toBe(false);
    expect(shouldSendSpikeAlert({ ...base, trend: "stable" })).toBe(false);
  });

  it("calculates a market percentile from rank", () => {
    expect(getMarketPercentile(1, 50)).toBe(100);
    expect(getMarketPercentile(50, 50)).toBe(0);
    expect(getMarketPercentile(3, 5)).toBe(50);
    expect(getMarketPercentile(0, 5)).toBeNull();
  });
});
