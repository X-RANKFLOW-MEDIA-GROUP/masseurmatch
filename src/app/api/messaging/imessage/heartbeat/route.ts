import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { assertImessageBridgeAuthorized } from "@/lib/messaging/imessage-bridge-auth";

const workerSchema = z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9._:-]+$/);
const errorCodeSchema = z.string().trim().min(1).max(80).regex(/^[A-Z0-9_]+$/);

const heartbeatSchema = z.object({
  bridgeVersion: z.string().trim().min(1).max(80),
  startedAt: z.string().datetime(),
  lastCycleAt: z.string().datetime().optional().nullable(),
  lastInboundAt: z.string().datetime().optional().nullable(),
  lastOutboundAt: z.string().datetime().optional().nullable(),
  lastErrorCode: errorCodeSchema.optional().nullable(),
  lastErrorAt: z.string().datetime().optional().nullable(),
  replayHistory: z.boolean(),
  pollMs: z.number().int().min(2000).max(60_000),
});

type Db = ReturnType<typeof createSupabaseAdminClient> & { from: (table: string) => any };

export async function POST(request: Request) {
  try {
    assertImessageBridgeAuthorized(request);
    assertRateLimit(request, "imessage-bridge-heartbeat", { limit: 180, windowMs: 60_000 });

    const workerId = workerSchema.parse(
      request.headers.get("x-imessage-worker-id") || "masseurmatch-imessage-01",
    );
    const body = await parseJsonBody(request, heartbeatSchema);
    const now = new Date().toISOString();
    const db = createSupabaseAdminClient() as Db;

    const result = await db
      .from("messaging_imessage_bridge_workers")
      .upsert(
        {
          worker_id: workerId,
          bridge_version: body.bridgeVersion,
          started_at: body.startedAt,
          last_seen_at: now,
          last_cycle_at: body.lastCycleAt || null,
          last_inbound_at: body.lastInboundAt || null,
          last_outbound_at: body.lastOutboundAt || null,
          last_error_code: body.lastErrorCode || null,
          last_error_at: body.lastErrorAt || null,
          replay_history: body.replayHistory,
          poll_ms: body.pollMs,
          updated_at: now,
        },
        { onConflict: "worker_id" },
      )
      .select("worker_id,last_seen_at")
      .single();

    if (result.error) throw new Error(result.error.message);
    return json({ ok: true, workerId: result.data.worker_id, lastSeenAt: result.data.last_seen_at });
  } catch (error) {
    return errorResponse(error);
  }
}
