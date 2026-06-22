import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { envAny } from "@/app/api/_lib/env";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "newsletter", { limit: 5, windowMs: 60_000 });

    const body = await parseJsonBody(request, schema);
    const email = body.email.trim().toLowerCase();

    const apiKey = envAny(["RESEND_API_KEY"]);
    if (apiKey) {
      const from = envAny(["RESEND_FROM_EMAIL"], "MasseurMatch <onboarding@resend.dev>");
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: ["support@masseurmatch.com"],
          reply_to: email,
          subject: "[Newsletter] New subscriber",
          text: `New newsletter subscriber: ${email}`,
        }),
      });
    }

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
