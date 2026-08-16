export const dynamic = "force-dynamic";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { getImessageBridgeStatus } from "@/lib/messaging/imessage-bridge-health";

type Db = ReturnType<typeof createSupabaseAdminClient> & { from: (table: string) => any };

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
    message.includes("messaging_imessage_bridge_workers") &&
    (message.includes("does not exist") || message.includes("schema cache"))
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    assertRateLimit(request, "admin-imessage-bridge-health", { limit: 120, windowMs: 60_000 });

    const db = createSupabaseAdminClient() as Db;
    const result = await db
      .from("messaging_imessage_bridge_workers")
      .select(
        "worker_id,bridge_version,started_at,last_seen_at,last_cycle_at,last_inbound_at,last_outbound_at,last_error_code,last_error_at,replay_history,poll_ms",
      )
      .order("last_seen_at", { ascending: false })
      .limit(10);

    if (result.error) {
      if (isMigrationPending(result.error.message)) {
        return json({ ok: true, migrationPending: true, workers: [] });
      }
      throw new RouteError(500, result.error.message);
    }

    const workers = ((result.data || []) as WorkerRow[]).map((worker) => ({
      ...worker,
      status: getImessageBridgeStatus(worker),
    }));

    return json({ ok: true, migrationPending: false, workers });
  } catch (error) {
    return errorResponse(error);
  }
}
