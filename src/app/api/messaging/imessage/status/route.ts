import { z } from "zod";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { assertImessageBridgeAuthorized } from "@/lib/messaging/imessage-bridge-auth";

const statusSchema = z.object({
  queueId: z.string().uuid(),
  status: z.enum(["sent", "delivered", "failed"]),
  externalId: z.string().trim().max(240).optional().nullable(),
  errorCode: z.string().trim().max(120).optional().nullable(),
  errorMessage: z.string().trim().max(500).optional().nullable(),
  retryable: z.boolean().optional().default(false),
  occurredAt: z.string().datetime().optional().nullable(),
});

const workerSchema = z.string().trim().min(1).max(120);

type Db = ReturnType<typeof createSupabaseAdminClient> & { from: (table: string) => any };

export async function POST(request: Request) {
  try {
    assertImessageBridgeAuthorized(request);
    assertRateLimit(request, "imessage-bridge-status", { limit: 600, windowMs: 60_000 });
    const workerId = workerSchema.parse(request.headers.get("x-imessage-worker-id") || "imessage-bridge");
    const body = await parseJsonBody(request, statusSchema);
    const db = createSupabaseAdminClient() as Db;

    const queueResult = await db
      .from("messaging_queue")
      .select("id,message_id,attempts,max_attempts,status,transport_preference,locked_by")
      .eq("id", body.queueId)
      .single();
    if (queueResult.error) throw new Error(queueResult.error.message);
    const queue = queueResult.data as {
      id: string;
      message_id: string | null;
      attempts: number;
      max_attempts: number;
      status: string;
      transport_preference: string;
      locked_by: string | null;
    };

    if (queue.transport_preference !== "imessage") {
      throw new RouteError(409, "Queue item is not assigned to iMessage.", "IMESSAGE_QUEUE_TRANSPORT_MISMATCH");
    }

    if (body.status === "delivered") {
      if (!new Set(["sent", "delivered"]).has(queue.status)) {
        throw new RouteError(409, "Queue item is not eligible for a delivered update.", "IMESSAGE_QUEUE_STATUS_MISMATCH");
      }
    } else if (queue.status !== "claimed" || queue.locked_by !== workerId) {
      throw new RouteError(409, "Queue item is not claimed by this iMessage worker.", "IMESSAGE_QUEUE_WORKER_MISMATCH");
    }

    const occurredAt = body.occurredAt || new Date().toISOString();
    const canRetry = body.status === "failed" && body.retryable && queue.attempts < queue.max_attempts;

    if (canRetry) {
      const retryQueue = await db
        .from("messaging_queue")
        .update({
          status: "pending",
          locked_at: null,
          locked_by: null,
          last_error: body.errorMessage || body.errorCode || "imessage_transient_failure",
          scheduled_for: new Date(Date.now() + 30_000).toISOString(),
        })
        .eq("id", queue.id);
      if (retryQueue.error) throw new Error(retryQueue.error.message);

      if (queue.message_id) {
        await db
          .from("messaging_messages")
          .update({
            delivery_status: "queued",
            error_code: body.errorCode || null,
            error_message: body.errorMessage || null,
          })
          .eq("id", queue.message_id);
      }
      return json({ ok: true, retryScheduled: true });
    }

    const queuePatch: Record<string, unknown> = {
      status: body.status,
      locked_at: null,
      locked_by: null,
    };
    if (body.status === "sent") queuePatch.sent_at = occurredAt;
    if (body.status === "delivered") {
      queuePatch.sent_at = occurredAt;
      queuePatch.delivered_at = occurredAt;
    }
    if (body.status === "failed") {
      queuePatch.failed_at = occurredAt;
      queuePatch.last_error = body.errorMessage || body.errorCode || "imessage_send_failed";
    }

    const queueUpdate = await db.from("messaging_queue").update(queuePatch).eq("id", queue.id);
    if (queueUpdate.error) throw new Error(queueUpdate.error.message);

    if (queue.message_id) {
      const messagePatch: Record<string, unknown> = {
        delivery_status: body.status,
      };
      if (body.externalId) messagePatch.external_id = body.externalId;
      if (body.status === "sent") messagePatch.sent_at = occurredAt;
      if (body.status === "delivered") {
        messagePatch.sent_at = occurredAt;
        messagePatch.delivered_at = occurredAt;
      }
      if (body.status === "failed") {
        messagePatch.failed_at = occurredAt;
        messagePatch.error_code = body.errorCode || null;
        messagePatch.error_message = body.errorMessage || "iMessage send failed";
      }
      const messageUpdate = await db.from("messaging_messages").update(messagePatch).eq("id", queue.message_id);
      if (messageUpdate.error) throw new Error(messageUpdate.error.message);
    }

    return json({ ok: true, retryScheduled: false });
  } catch (error) {
    return errorResponse(error);
  }
}
