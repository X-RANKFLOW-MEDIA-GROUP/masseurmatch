import { NextRequest, NextResponse } from "next/server";

import { buildTwimlEmpty, buildTwimlReply, getConversationHistory, logSms, validateTwilioSignature } from "@/lib/sms/twilio-utils";
import { generateVapiSmsReply } from "@/lib/knotty/vapi-chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function twiml(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function publicWebhookUrl(request: NextRequest): string {
  const configuredBase = process.env.NEXT_PUBLIC_APP_URL
    || process.env.NEXT_PUBLIC_BASE_URL
    || process.env.SITE_URL;

  if (configuredBase) {
    return `${configuredBase.replace(/\/$/, "")}/api/twilio/sms`;
  }

  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "masseurmatch.com";
  return `${protocol}://${host}/api/twilio/sms`;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  const from = params.From?.trim() ?? "";
  const to = params.To?.trim() ?? "";
  const body = params.Body?.trim() ?? "";
  const messageSid = params.MessageSid?.trim() ?? "";

  if (!from || !to || !body) {
    return twiml(buildTwimlEmpty());
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!authToken) {
    return new NextResponse("Twilio authentication is not configured.", { status: 503 });
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  if (!signature || !validateTwilioSignature(signature, publicWebhookUrl(request), params)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await logSms({
    profile_id: null,
    from_number: from,
    to_number: to,
    direction: "inbound",
    body,
    twilio_sid: messageSid || null,
    intent: "knotty_vapi_chat",
    status: "received",
    is_manual: false,
    booking_inquiry_id: null,
  });

  try {
    const history = await getConversationHistory(from, to, 14);
    const reply = await generateVapiSmsReply({ from, to, history });

    await logSms({
      profile_id: null,
      from_number: to,
      to_number: from,
      direction: "outbound",
      body: reply,
      twilio_sid: null,
      intent: "knotty_vapi_chat",
      status: "sent",
      is_manual: false,
      booking_inquiry_id: null,
    });

    return twiml(buildTwimlReply(reply));
  } catch (error) {
    console.error("Knotty Twilio SMS fallback failed", {
      messageSid,
      error: error instanceof Error ? error.message : String(error),
    });

    const fallback = "Sorry, Knotty is temporarily unavailable. Please try again shortly or contact MasseurMatch support.";

    await logSms({
      profile_id: null,
      from_number: to,
      to_number: from,
      direction: "outbound",
      body: fallback,
      twilio_sid: null,
      intent: "knotty_vapi_chat_error",
      status: "sent",
      is_manual: false,
      booking_inquiry_id: null,
    });

    return twiml(buildTwimlReply(fallback));
  }
}
