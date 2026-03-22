import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { getClientIp } from "@/app/_lib/security";
import { chatRequestSchema } from "@/app/_lib/validation";
import { handleKnottyRequest } from "@/lib/knotty/service";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, chatRequestSchema);
    const response = await handleKnottyRequest(
      {
        sessionId: `legacy-chat:${getClientIp(request)}`,
        messages:
          body.messages ||
          (body.message
            ? [
                {
                  role: "user",
                  content: body.message,
                },
              ]
            : []),
      },
      request,
    );

    return json({
      ok: true,
      reply: response.reply,
      intent: response.intent,
      primary: response.primary,
      alternatives: response.alternatives,
      blocked: response.blocked,
      nextStep: response.nextStep,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
