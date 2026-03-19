import { z } from "zod";

import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";

const eventSchema = z.object({
  event: z.string().min(1).max(80),
  page: z.string().max(80).optional(),
  ts: z.number().optional(),
}).catchall(z.unknown());

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, eventSchema);
    console.info("[mm-event]", JSON.stringify(body));

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}