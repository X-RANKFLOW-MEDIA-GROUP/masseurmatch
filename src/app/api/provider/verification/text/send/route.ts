import { NextResponse } from "next/server";
import twilio from "twilio";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { getRequestSession } from "@/app/api/_lib/session";

const sendSchema = z.object({
  phone: z.string().min(7).max(20),
});

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const CODE_TTL_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone } = sendSchema.parse(body);

    if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_PHONE) {
      console.error("Twilio credentials missing");
      return NextResponse.json({ error: "SMS service misconfigured" }, { status: 500 });
    }

    const client = twilio(TWILIO_SID, TWILIO_AUTH);
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const code = (100000 + (arr[0] % 900000)).toString();

    await client.messages.create({
      body: `Your MasseurMatch verification code is: ${code}`,
      from: TWILIO_PHONE,
      to: phone,
    });

    const supabase = createSupabaseAdminClient();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

    await supabase
      .from("profiles")
      .update({ phone_number: phone })
      .eq("user_id", session.userId);

    const { error: verificationError } = await supabase
      .from("text_verifications")
      .insert({
        user_id: session.userId,
        phone,
        code,
        submitted_text: phone,
        status: "pending",
        expires_at: expiresAt,
      });

    if (verificationError) {
      return NextResponse.json({ error: verificationError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Twilio send error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
