import twilio from "twilio";
import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const sendSchema = z.object({
  phone: z.string().min(7).max(20),
});

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const CODE_EXPIRY_MINUTES = 10;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const { phone } = await parseJsonBody(request, sendSchema);

    if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_PHONE) {
      console.warn("[provider.verification.text.send] Twilio credentials missing");
      throw new RouteError(503, "SMS verification is temporarily unavailable. Please try again shortly.");
    }

    const code = generateCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60_000).toISOString();
    const adminClient = createSupabaseAdminClient();

    const { error: insertError } = await adminClient.from("text_verifications").insert({
      user_id: session.userId,
      phone,
      verification_code: code,
      status: "pending",
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("[provider.verification.text.send] Failed to persist verification", {
        code: insertError.code,
        message: insertError.message,
      });
      throw new RouteError(500, "Could not start SMS verification. Please try again.");
    }

    try {
      const client = twilio(TWILIO_SID, TWILIO_AUTH);
      await client.messages.create({
        body: `Your MasseurMatch verification code is: ${code}`,
        from: TWILIO_PHONE,
        to: phone,
      });
    } catch (twilioError) {
      console.error("[provider.verification.text.send] Twilio delivery failed", {
        message: twilioError instanceof Error ? twilioError.message : "unknown",
      });

      await adminClient
        .from("text_verifications")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("user_id", session.userId)
        .eq("phone", phone)
        .eq("verification_code", code)
        .eq("status", "pending");

      throw new RouteError(503, "SMS delivery is temporarily unavailable. Please try again.");
    }

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
