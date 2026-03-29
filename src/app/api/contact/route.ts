import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { assertRateLimit, sanitizeOptionalText, sanitizeText } from "@/app/_lib/security";
import { contactFormSchema } from "@/app/_lib/validation";
import { sendSupportEmail } from "@/app/api/_lib/resend";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "contact-form", { limit: 8, windowMs: 60_000 });
    const body = await parseJsonBody(request, contactFormSchema);
    const payload = {
      name: sanitizeText(body.name),
      email: body.email.trim().toLowerCase(),
      phone: sanitizeOptionalText(body.phone),
      audience: body.audience,
      subject: sanitizeText(body.subject),
      message: sanitizeText(body.message),
    };
    const delivery = await sendSupportEmail(payload);

    return json({
      ok: true,
      to: delivery.to,
      resendId: delivery.id,
      mock: delivery.mock,
      subject: payload.subject,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
