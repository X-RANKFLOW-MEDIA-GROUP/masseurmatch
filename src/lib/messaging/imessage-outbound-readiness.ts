import type { ImessageBridgeStatus } from "@/lib/messaging/imessage-bridge-health";

export type ImessageOutboundArmBlocker =
  | "global_pause"
  | "no_worker"
  | "worker_not_online"
  | "replay_history_enabled"
  | "pending_imessage_queue"
  | "no_valid_consent";

export type ImessageOutboundReadinessInput = {
  globalPause: boolean;
  outboundEnabled: boolean;
  pendingQueueCount: number;
  validConsentCount: number;
  worker: {
    workerId: string;
    status: ImessageBridgeStatus;
    replayHistory: boolean;
  } | null;
};

export type ImessageOutboundReadiness = {
  canArm: boolean;
  blockers: ImessageOutboundArmBlocker[];
};

export function getImessageOutboundReadiness(
  input: ImessageOutboundReadinessInput,
): ImessageOutboundReadiness {
  const blockers: ImessageOutboundArmBlocker[] = [];

  if (input.globalPause) blockers.push("global_pause");

  if (!input.worker) {
    blockers.push("no_worker");
  } else {
    if (input.worker.status !== "online") blockers.push("worker_not_online");
    if (input.worker.replayHistory) blockers.push("replay_history_enabled");
  }

  if (input.pendingQueueCount > 0) blockers.push("pending_imessage_queue");
  if (input.validConsentCount < 1) blockers.push("no_valid_consent");

  return {
    canArm: !input.outboundEnabled && blockers.length === 0,
    blockers,
  };
}
