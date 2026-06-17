import { z } from "zod";
import { envAny } from "@/app/api/_lib/env";

const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().trim(),
  message: z.string().min(10).max(2000).trim(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

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
          reply_to: data.email,
          subject: `[Footer Contact] ${data.name}`,
          text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
        }),
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ ok: false, errors: err.flatten().fieldErrors }, { status: 422 });
    }
    return Response.json({ ok: false, message: "Unexpected error" }, { status: 500 });
  }
}
