import { NextResponse } from "next/server";
import { Resend } from "resend";
import { resendConfigured } from "@/mm/lib/env";
import { contactSchema } from "@/mm/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all contact fields." }, { status: 400 });
  }

  if (resendConfigured) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "MasseurMatch <hello@masseurmatch.com>",
      to: ["support@masseurmatch.com"],
      replyTo: parsed.data.email,
      subject: `Directory contact from ${parsed.data.name}`,
      text: parsed.data.message,
    });
  }

  return NextResponse.json({
    message: resendConfigured ? "Message sent to the directory team." : "Message saved. Configure Resend to forward production email.",
  });
}
