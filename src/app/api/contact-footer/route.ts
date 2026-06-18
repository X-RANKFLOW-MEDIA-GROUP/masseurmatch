import { z } from "zod";
import { envAny, envOptional } from "@/app/api/_lib/env";

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().trim(),
  message: z.string().min(10).max(2000).trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const apiKey = envOptional(["RESEND_API_KEY"]);
    if (!apiKey) {
      console.warn("[contact-footer] RESEND_API_KEY not set — email not sent");
      return Response.json({ ok: true });
    }

    const from = envAny(["RESEND_FROM_EMAIL"], "MasseurMatch <onboarding@resend.dev>");
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["support@masseurmatch.com"],
        reply_to: data.email,
        subject: `[Footer Contact] ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => "");
      console.error("[contact-footer] Resend error", resendRes.status, detail);
      return Response.json({ ok: false, message: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ ok: false, errors: err.flatten().fieldErrors }, { status: 422 });
    }
    console.error("[contact-footer] Unexpected error", err);
    return Response.json({ ok: false, message: "Unexpected error" }, { status: 500 });
  }
}
