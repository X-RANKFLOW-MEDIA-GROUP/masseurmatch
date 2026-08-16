export const dynamic = "force-dynamic";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { getImessageBridgeStatus } from "@/lib/messaging/imessage-bridge-health";
import { getImessageOutboundReadiness } from "@/lib/messaging/imessage-outbound-readiness";

type Db = { from: (table: string) => any };

type WorkerRow = {
  worker_id: string;
  bridge_version: string;
  started_at: string;
  last_seen_at: string;
  last_cycle_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  last_error_code: string | null;
  last_error_at: string | null;
  replay_history: boolean;
  poll_ms: number;
};

function isMigrationPending(message = "") {
  return (
    (message.includes("messaging_imessage_bridge_workers") ||
      message.includes("imessage_outbound_enabled")) &&
    (message.includes("does not exist") || message.includes("schema cache"))
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, "admin-imessage-bridge-health", { limit: 120, windowMs: 60_000 });

    const db = createSupabaseAdminClient() as unknown as Db;
    const [workersResult, settingsResult, queueResult, consentResult] = await Promise.all([
      db
        .from("messaging_imessage_bridge_workers")
        .select(
          "worker_id,bridge_version,started_at,last_seen_at,last_cycle_at,last_inbound_at,last_outbound_at,last_error_code,last_error_at,replay_history,poll_ms",
        )
        .order("last_seen_at", { ascending: false })
        .limit(10),
      db
        .from("messaging_settings")
        .select("global_pause,imessage_outbound_enabled")
        .eq("id", "default")
        .single(),
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

    const errors = [workersResult.error, settingsResult.error, queueResult.error, consentResult.error].filter(
      Boolean,
    ) as Array<{ message: string }>;

    if (errors.some((error) => isMigrationPending(error.message))) {
      return json({ ok: true, migrationPending: true, workers: [], safety: null });
    }
    if (errors[0]) throw new RouteError(500, errors[0].message);

    const workers = ((workersResult.data || []) as WorkerRow[]).map((worker) => ({
      ...worker,
      status: getImessageBridgeStatus(worker),
    }));
    const primary = workers[0] || null;
    const snapshot = {
      globalPause: Boolean(settingsResult.data.global_pause),
      outboundEnabled: Boolean(settingsResult.data.imessage_outbound_enabled),
      pendingQueueCount: queueResult.count || 0,
      validConsentCount: consentResult.count || 0,
      worker: primary
        ? {
            workerId: primary.worker_id,
            status: primary.status,
            replayHistory: Boolean(primary.replay_history),
          }
        : null,
    };

    return json({
      ok: true,
      migrationPending: false,
      workers,
      safety: {
        ...snapshot,
        readiness: getImessageOutboundReadiness(snapshot),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
