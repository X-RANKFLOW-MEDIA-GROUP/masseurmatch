import { describe, expect, it } from "vitest";

import { getImessageOutboundReadiness } from "@/lib/messaging/imessage-outbound-readiness";

const safeWorker = {
  workerId: "masseurmatch-mac-01",
  status: "online" as const,
  replayHistory: false,
};

function readiness(overrides: Partial<Parameters<typeof getImessageOutboundReadiness>[0]> = {}) {
  return getImessageOutboundReadiness({
    globalPause: false,
    outboundEnabled: false,
    pendingQueueCount: 0,
    validConsentCount: 1,
    worker: safeWorker,
    ...overrides,
  });
}

describe("iMessage outbound arm readiness", () => {
  it("allows arming only when every safety precondition is satisfied", () => {
    expect(readiness()).toEqual({ canArm: true, blockers: [] });
  });

  it("blocks arming while global messaging is paused", () => {
    expect(readiness({ globalPause: true })).toEqual({
      canArm: false,
      blockers: ["global_pause"],
    });
  });

  it("requires one online worker with replay disabled", () => {
    expect(readiness({ worker: null }).blockers).toContain("no_worker");
    expect(readiness({ worker: { ...safeWorker, status: "offline" } }).blockers).toContain(
      "worker_not_online",
    );
    expect(readiness({ worker: { ...safeWorker, replayHistory: true } }).blockers).toContain(
      "replay_history_enabled",
    );
  });

  it("blocks arming when old iMessage work could flush", () => {
    expect(readiness({ pendingQueueCount: 1 }).blockers).toContain("pending_imessage_queue");
  });

  it("requires at least one provider with current dedicated consent", () => {
    expect(readiness({ validConsentCount: 0 }).blockers).toContain("no_valid_consent");
  });

  it("does not offer another arm action when already enabled", () => {
    expect(readiness({ outboundEnabled: true })).toEqual({ canArm: false, blockers: [] });
  });
});
