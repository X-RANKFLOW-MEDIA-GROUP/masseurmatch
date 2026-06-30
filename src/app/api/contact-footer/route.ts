import { z } from "zod";
import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { assertRateLimit, sanitizeText } from "@/app/_lib/security";
import { sendSupportEmail } from "@/app/api/_lib/resend";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  message: z.string().min(10).max(2000),
  website: z.string().optional(), // honeypot: must be empty for legitimate submissions
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "contact-footer", { limit: 5, windowMs: 60_000 });

    const body = await parseJsonBody(request, schema);
    if (body.website) return json({ ok: true }); // silently discard bot submissions
    const delivery = await sendSupportEmail({
      name: sanitizeText(body.name),
      email: body.email.trim().toLowerCase(),
      subject: "Website Contact (Footer Form)",
      message: sanitizeText(body.message),
      audience: "other",
    });

    return json({ ok: true, mock: delivery.mock });
  } catch (error) {
    return errorResponse(error);
  }
}
