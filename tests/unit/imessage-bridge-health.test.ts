import { describe, expect, it } from "vitest";

import { getImessageBridgeStatus } from "@/lib/messaging/imessage-bridge-health";

const NOW = Date.parse("2026-08-16T03:00:00.000Z");

describe("iMessage bridge health", () => {
  it("reports online for a fresh heartbeat with no unresolved error", () => {
    expect(
      getImessageBridgeStatus(
        {
          last_seen_at: "2026-08-16T02:59:30.000Z",
          last_cycle_at: "2026-08-16T02:59:29.000Z",
          last_error_at: null,
        },
        NOW,
      ),
    ).toBe("online");
  });

  it("reports offline when the heartbeat is stale", () => {
    expect(
      getImessageBridgeStatus(
        {
          last_seen_at: "2026-08-16T02:58:00.000Z",
          last_cycle_at: "2026-08-16T02:57:59.000Z",
          last_error_at: null,
        },
        NOW,
      ),
    ).toBe("offline");
  });

  it("reports degraded when the latest error is newer than the last successful cycle", () => {
    expect(
      getImessageBridgeStatus(
        {
          last_seen_at: "2026-08-16T02:59:45.000Z",
          last_cycle_at: "2026-08-16T02:59:20.000Z",
          last_error_at: "2026-08-16T02:59:30.000Z",
        },
        NOW,
      ),
    ).toBe("degraded");
  });

  it("returns online after a successful cycle occurs after the last error", () => {
    expect(
      getImessageBridgeStatus(
        {
          last_seen_at: "2026-08-16T02:59:50.000Z",
          last_cycle_at: "2026-08-16T02:59:45.000Z",
          last_error_at: "2026-08-16T02:59:30.000Z",
        },
        NOW,
      ),
    ).toBe("online");
  });
});
