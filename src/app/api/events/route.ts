import { z } from "zod";
import { errorResponse, json, readRequestJson } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { getRequestSession } from "@/app/api/_lib/session";
import { knottyEventSchema } from "@/app/_lib/validation";
import { persistRankingEvents } from "@/lib/knotty/server-events";
import { KNOTTY_EVENT_NAMES } from "@/lib/knotty/types";

const genericEventSchema = z
  .object({
    event: z.string().min(1).max(120),
  })
  .catchall(z.unknown());

function isKnottyEventName(event: string) {
  return (KNOTTY_EVENT_NAMES as readonly string[]).includes(event);
}

export async function POST(request: Request) {
  try {
    const body = await readRequestJson(request);
    const generic = genericEventSchema.parse(body);

    if (!isKnottyEventName(generic.event)) {
      console.info("[mm-event]", JSON.stringify(generic));
      return json({ ok: true, persisted: false });
    }

    const parsed = knottyEventSchema.parse(body);
    let persisted = false;

    try {
      const adminClient = createSupabaseAdminClient();
      const session = getRequestSession(request);
      await persistRankingEvents(adminClient, [parsed], session?.userId || null);
      persisted = true;
    } catch {
      persisted = false;
    }

    return json({ ok: true, persisted });
  } catch (error) {
    return errorResponse(error);
  }
}
