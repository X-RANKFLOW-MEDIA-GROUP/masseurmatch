export const dynamic = "force-dynamic";

import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { getImessageBridgeStatus } from "@/lib/messaging/imessage-bridge-health";
import {
  getImessageOutboundReadiness,
  type ImessageOutboundArmBlocker,
} from "@/lib/messaging/imessage-outbound-readiness";

const requestSchema = z
  .object({
    action: z.enum(["arm", "disarm"]),
    workerId: z.string().trim().min(1).max(120).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === "arm" && !value.workerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workerId"],
        message: "workerId is required to arm outbound iMessage.",
      });
    }
  });

type Db = { from: (table: string) => any };

type WorkerRow = {
  worker_id: string;
  last_seen_at: string | null;
  last_cycle_at: string | null;
  last_error_at: string | null;
  replay_history: boolean;
};

function blockerMessage(blocker: ImessageOutboundArmBlocker) {
  switch (blocker) {
    case "global_pause":
      return "global messaging is paused";
    case "no_worker":
      return "the selected bridge worker is missing";
    case "worker_not_online":
      return "the selected bridge worker is not online";
    case "replay_history_enabled":
      return "history replay is enabled on the selected worker";
    case "pending_imessage_queue":
      return "pending or claimed iMessage queue rows already exist";
    case "no_valid_consent":
      return "no provider currently has valid dedicated iMessage consent";
  }
}

async function loadReadiness(db: Db, workerId: string) {
  const [settingsResult, workerResult, queueResult, consentResult] = await Promise.all([
    db
      .from("messaging_settings")
      .select("global_pause,imessage_outbound_enabled")
      .eq("id", "default")
      .single(),
    db
      .from("messaging_imessage_bridge_workers")
      .select("worker_id,last_seen_at,last_cycle_at,last_error_at,replay_history")
      .eq("worker_id", workerId)
      .maybeSingle(),
    db
      .from("messaging_queue")
      .select("id", { count: "exact", head: true })
      .eq("transport_preference", "imessage")
      .in("status", ["pending", "claimed"]),
    db
      .from("user_notification_preferences")
      .select("user_id", { count: "exact", head: true })
      .eq("imessage_profile_assistant_enabled", true)
      .not("imessage_profile_assistant_consent_at", "is", null)
      .not("imessage_profile_assistant_consent_version", "is", null)
      .is("imessage_profile_assistant_opted_out_at", null)
      .not("phone_e164", "is", null),
  ]);

  if (settingsResult.error) throw new RouteError(500, settingsResult.error.message);
  if (workerResult.error) throw new RouteError(500, workerResult.error.message);
  if (queueResult.error) throw new RouteError(500, queueResult.error.message);
  if (consentResult.error) throw new RouteError(500, consentResult.error.message);

  const worker = (workerResult.data || null) as WorkerRow | null;
  const status = worker ? getImessageBridgeStatus(worker) : null;
  const snapshot = {
    globalPause: Boolean(settingsResult.data.global_pause),
    outboundEnabled: Boolean(settingsResult.data.imessage_outbound_enabled),
    pendingQueueCount: queueResult.count || 0,
    validConsentCount: consentResult.count || 0,
    worker: worker
      ? {
          workerId: worker.worker_id,
          status: status!,
          replayHistory: Boolean(worker.replay_history),
        }
      : null,
  };

  return {
    snapshot,
    readiness: getImessageOutboundReadiness(snapshot),
  };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-imessage-outbound-control", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, requestSchema);
    const db = createSupabaseAdminClient() as unknown as Db;

    if (body.action === "disarm") {
      const { data, error } = await db
        .from("messaging_settings")
        .update({ imessage_outbound_enabled: false, updated_at: new Date().toISOString() })
        .eq("id", "default")
        .select("global_pause,imessage_outbound_enabled,updated_at")
        .single();
      if (error) throw new RouteError(500, error.message);

      await recordAuditLog(
        admin.userId,
        "admin_imessage_outbound_disarmed",
        "messaging_settings",
        "default",
        { workerId: body.workerId || null },
      );

      return json({ ok: true, action: "disarm", settings: data });
    }

    const { snapshot, readiness } = await loadReadiness(db, body.workerId!);
    if (snapshot.outboundEnabled) {
      return json({ ok: true, action: "arm", changed: false, readiness, snapshot });
    }

    if (!readiness.canArm) {
      throw new RouteError(
        409,
        `Cannot arm outbound iMessage: ${readiness.blockers.map(blockerMessage).join("; ")}.`,
      );
    }

    const { data, error } = await db
      .from("messaging_settings")
      .update({ imessage_outbound_enabled: true, updated_at: new Date().toISOString() })
      .eq("id", "default")
      .eq("global_pause", false)
      .eq("imessage_outbound_enabled", false)
      .select("global_pause,imessage_outbound_enabled,updated_at")
      .maybeSingle();
    if (error) throw new RouteError(500, error.message);
    if (!data) {
      throw new RouteError(409, "Outbound iMessage state changed while arming. Refresh and try again.");
    }

    await recordAuditLog(
      admin.userId,
      "admin_imessage_outbound_armed",
      "messaging_settings",
      "default",
      {
        workerId: body.workerId,
        pendingQueueCount: snapshot.pendingQueueCount,
        validConsentCount: snapshot.validConsentCount,
      },
    );

    return json({ ok: true, action: "arm", changed: true, settings: data, readiness, snapshot });
  } catch (error) {
    return errorResponse(error);
  }
}
