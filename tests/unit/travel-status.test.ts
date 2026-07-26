import { describe, expect, it } from "vitest";

import { getTravelVisit, VISITING_LOOKAHEAD_DAYS } from "@/app/_lib/travel-status";

const DAY_MS = 24 * 60 * 60 * 1000;

// Fixed reference time: 2026-07-25T12:00:00Z
const NOW = Date.parse("2026-07-25T12:00:00Z");

const entry = (city: string, start: string, end: string) => ({
  city,
  start_date: start,
  end_date: end,
});

describe("getTravelVisit", () => {
  it("returns null for empty or missing schedules", () => {
    expect(getTravelVisit(null, null, NOW)).toBeNull();
    expect(getTravelVisit(undefined, null, NOW)).toBeNull();
    expect(getTravelVisit([], null, NOW)).toBeNull();
  });

  it("reports 'now' while today is inside the visit dates", () => {
    const visit = getTravelVisit([entry("Denver", "2026-07-24", "2026-07-28")], null, NOW);
    expect(visit?.status).toBe("now");
    expect(visit?.entry.city).toBe("Denver");
  });

  it("treats the start and end dates as inclusive", () => {
    const schedule = [entry("Denver", "2026-07-25", "2026-07-25")];
    expect(getTravelVisit(schedule, null, NOW)?.status).toBe("now");
  });

  it("reports 'soon' until one day prior, then 'now' on arrival day", () => {
    const schedule = [entry("Austin", "2026-07-26", "2026-07-30")];
    // Day before arrival → still "soon"
    expect(getTravelVisit(schedule, null, NOW)?.status).toBe("soon");
    // Arrival day → "now"
    expect(getTravelVisit(schedule, null, NOW + DAY_MS)?.status).toBe("now");
  });

  it("ignores visits beyond the lookahead window", () => {
    const farStart = new Date(NOW + (VISITING_LOOKAHEAD_DAYS + 2) * DAY_MS)
      .toISOString()
      .slice(0, 10);
    const farEnd = new Date(NOW + (VISITING_LOOKAHEAD_DAYS + 5) * DAY_MS)
      .toISOString()
      .slice(0, 10);
    expect(getTravelVisit([entry("Miami", farStart, farEnd)], null, NOW)).toBeNull();
  });

  it("ignores visits that already ended", () => {
    expect(getTravelVisit([entry("Miami", "2026-07-01", "2026-07-05")], null, NOW)).toBeNull();
  });

  it("filters by city case-insensitively when a city is given", () => {
    const schedule = [
      entry("Austin", "2026-07-24", "2026-07-28"),
      entry("Chicago", "2026-07-27", "2026-07-30"),
    ];
    expect(getTravelVisit(schedule, "austin", NOW)?.entry.city).toBe("Austin");
    expect(getTravelVisit(schedule, "CHICAGO", NOW)?.status).toBe("soon");
    expect(getTravelVisit(schedule, "Seattle", NOW)).toBeNull();
  });

  it("prefers an active visit over an upcoming one", () => {
    const schedule = [
      entry("Chicago", "2026-07-27", "2026-07-30"),
      entry("Austin", "2026-07-24", "2026-07-28"),
    ];
    const visit = getTravelVisit(schedule, null, NOW);
    expect(visit?.status).toBe("now");
    expect(visit?.entry.city).toBe("Austin");
  });

  it("picks the soonest upcoming visit when several are pending", () => {
    const schedule = [
      entry("Chicago", "2026-07-30", "2026-08-02"),
      entry("Austin", "2026-07-27", "2026-07-29"),
    ];
    const visit = getTravelVisit(schedule, null, NOW);
    expect(visit?.status).toBe("soon");
    expect(visit?.entry.city).toBe("Austin");
  });

  it("skips malformed entries without crashing", () => {
    const schedule = [
      { city: "Austin", start_date: "not-a-date", end_date: "2026-07-30" },
      { city: "", start_date: "2026-07-24", end_date: "2026-07-28" },
      entry("Denver", "2026-07-24", "2026-07-28"),
    ];
    expect(getTravelVisit(schedule, null, NOW)?.entry.city).toBe("Denver");
  });
});
