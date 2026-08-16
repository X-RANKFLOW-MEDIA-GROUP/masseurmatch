import { z } from "zod";

import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { assertImessageBridgeAuthorized } from "@/lib/messaging/imessage-bridge-auth";
import { processKnottyImessageInbound } from "@/lib/messaging/knotty-imessage";

const inboundSchema = z.object({
  from: z.string().trim().min(8).max(40),
  to: z.string().trim().min(8).max(40).optional().nullable(),
  body: z.string().trim().min(1).max(4000),
  externalId: z.string().trim().min(1).max(240),
  receivedAt: z.string().datetime().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    assertImessageBridgeAuthorized(request);
    assertRateLimit(request, "imessage-bridge-inbound", { limit: 240, windowMs: 60_000 });
    const body = await parseJsonBody(request, inboundSchema);
    const result = await processKnottyImessageInbound(body);
    return json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
