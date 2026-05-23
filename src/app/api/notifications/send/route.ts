import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import type { Json } from "@/integrations/supabase/types";
import { Resend } from "resend";
import twilio from "twilio";

const resendApiKey = process.env.RESEND_API_KEY;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

type SendPayload = {
  userId: string;
  type: string;
  title: string;
  message?: string;
  emailTo?: string;
  smsTo?: string;
  channels?: Array<"in_app" | "email" | "sms" | "push">;
  data?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendPayload;

    if (!body.userId || !body.type || !body.title) {
      return NextResponse.json({ error: "userId, type and title are required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: prefs } = await supabase
      .from("user_notification_preferences")
      .select("email_enabled,sms_enabled,push_enabled,phone_e164")
      .eq("user_id", body.userId)
      .maybeSingle();

    const channels = body.channels && body.channels.length > 0
      ? body.channels
      : (["in_app", "email", "sms", "push"] as const);

    let notificationId: string | null = null;

    if (channels.includes("in_app")) {
      const { data: notification, error } = await supabase
        .from("notifications")
        .insert({
          user_id: body.userId,
          type: body.type,
          title: body.title,
          message: body.message ?? null,
          data: (body.data ?? {}) as Json,
        })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      notificationId = notification.id;

      await supabase.from("notification_deliveries").insert({
        notification_id: notificationId,
        user_id: body.userId,
        channel: "in_app",
        provider: "supabase",
        status: "sent",
        payload: (body.data ?? {}) as Json,
      });
    }

    if (channels.includes("email") && prefs?.email_enabled !== false && body.emailTo) {
      const from = process.env.RESEND_FROM_EMAIL || "MasseurMatch <onboarding@resend.dev>";
      if (!resendApiKey) {
        await logDelivery({
          notificationId,
          userId: body.userId,
          channel: "email",
          provider: "resend",
          destination: body.emailTo,
          status: "failed",
          errorMessage: "RESEND_API_KEY missing",
          payload: body.data,
        });
      } else {
        const resend = new Resend(resendApiKey);
        const result = await resend.emails.send({
          from,
          to: body.emailTo,
          subject: body.title,
          text: body.message || body.title,
        });

        await logDelivery({
          notificationId,
          userId: body.userId,
          channel: "email",
          provider: "resend",
          providerMessageId: result.data?.id,
          destination: body.emailTo,
          status: result.error ? "failed" : "sent",
          errorMessage: result.error?.message,
          payload: body.data,
        });
      }
    }

    if (channels.includes("sms") && prefs?.sms_enabled === true) {
      const smsTo = body.smsTo || prefs.phone_e164 || undefined;
      if (twilioAccountSid && twilioAuthToken && twilioPhone && smsTo) {
        const client = twilio(twilioAccountSid, twilioAuthToken);
        const sms = await client.messages.create({
          body: body.message || body.title,
          from: twilioPhone,
          to: smsTo,
        });

        await logDelivery({
          notificationId,
          userId: body.userId,
          channel: "sms",
          provider: "twilio",
          providerMessageId: sms.sid,
          destination: smsTo,
          status: "sent",
          payload: body.data,
        });
      } else {
        await logDelivery({
          notificationId,
          userId: body.userId,
          channel: "sms",
          provider: "twilio",
          destination: smsTo,
          status: "failed",
          errorMessage: "Twilio not configured or smsTo missing",
          payload: body.data,
        });
      }
    }

    if (channels.includes("push") && prefs?.push_enabled === true) {
      // Push is queued/logged now; delivery can be performed by an Edge Function worker.
      await logDelivery({
        notificationId,
        userId: body.userId,
        channel: "push",
        provider: "queue",
        status: "queued",
        payload: {
          ...(body.data ?? {}),
          title: body.title,
          message: body.message ?? null,
        },
      });
    }

    return NextResponse.json({ success: true, notificationId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 },
    );
  }
}

async function logDelivery(input: {
  notificationId: string | null;
  userId: string;
  channel: "email" | "sms" | "push";
  provider: string;
  status: "queued" | "sent" | "failed";
  providerMessageId?: string;
  destination?: string;
  errorMessage?: string;
  payload?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("notification_deliveries").insert({
    notification_id: input.notificationId,
    user_id: input.userId,
    channel: input.channel,
    provider: input.provider,
    provider_message_id: input.providerMessageId ?? null,
    destination: input.destination ?? null,
    status: input.status,
    error_message: input.errorMessage ?? null,
    payload: (input.payload ?? {}) as Json,
  });
}
