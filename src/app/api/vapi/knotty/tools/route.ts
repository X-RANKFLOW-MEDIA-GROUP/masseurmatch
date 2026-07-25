export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { errorResponse, json, readRequestJson } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { isVapiEndOfCallReport, logVapiCallToSupportTicket } from "@/lib/knotty/vapi-call-tickets";
import { assertVapiAuthorization, handleVapiToolWebhook } from "@/lib/knotty/vapi-tools";

export async function GET() {
  return json({
    ok: true,
    service: "knotty-vapi-tools",
    status: "ready",
    accepts: ["tool-calls", "end-of-call-report"],
  });
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "knotty-vapi-tools", { limit: 60, windowMs: 60_000 });
    assertVapiAuthorization(request);
    const body = await readRequestJson(request);

    if (isVapiEndOfCallReport(body)) {
      return json(await logVapiCallToSupportTicket(body));
    }

    const response = await handleVapiToolWebhook(body);
    return json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
