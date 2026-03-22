import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { knottyRequestSchema } from "@/app/_lib/validation";
import { handleKnottyRequest } from "@/lib/knotty/service";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "knotty", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, knottyRequestSchema);
    const response = await handleKnottyRequest(body, request);
    return json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
