import { z } from "zod";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { assertImessageBridgeAuthorized } from "@/lib/messaging/imessage-bridge-auth";

const workerSchema = z.string().trim().min(1).max(120);

type Db = ReturnType<typeof createSupabaseAdminClient> & { rpc: (fn: string, args?: any) => any };

export async function POST(request: Request) {
  try {
    assertImessageBridgeAuthorized(request);
    assertRateLimit(request, "imessage-bridge-claim", { limit: 360, windowMs: 60_000 });

    const workerId = workerSchema.parse(request.headers.get("x-imessage-worker-id") || "imessage-bridge");
    const db = createSupabaseAdminClient() as Db;
    const { data, error } = await db.rpc("messaging_claim_next_imessage_queue", { p_worker_id: workerId });
    if (error) throw new Error(error.message);

    const item = Array.isArray(data) ? data[0] ?? null : data ?? null;
    return json({ ok: true, item });
  } catch (error) {
    return errorResponse(error);
  }
}
