import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, getUserRole } from "@/app/api/_lib/supabase-server";
import { getRequestSession } from "@/app/api/_lib/session";
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
  metadata?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.userId);
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as SendPayload;
    if (!body.userId || !body.type || !body.title) {
      return NextResponse.json({ error: "userId, type, and title are required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const channels = body.channels?.length ? body.channels : ["in_app"];
    const delivery: Record<string, unknown> = {};

    if (channels.includes("in_app")) {
      const { error } = await supabase.from("notifications").insert({
        user_id: body.userId,
        type: body.type,
        title: body.title,
        message: body.message ?? null,
        metadata: (body.metadata ?? {}) as Json,
      });
      if (error) throw error;
      delivery.in_app = { success: true };
    }

    if (channels.includes("email")) {
      if (!body.emailTo) {
        delivery.email = { success: false, error: "Missing emailTo" };
      } else if (!resendApiKey) {
        delivery.email = { success: false, error: "RESEND_API_KEY not configured" };
      } else {
        try {
          const resend = new Resend(resendApiKey);
          const { data, error } = await resend.emails.send({
            from: "MasseurMatch <notifications@masseurmatch.com>",
            to: body.emailTo,
            subject: body.title,
            html: `<div style="font-family:Arial,sans-serif;color:#111827"><h2>${escapeHtml(body.title)}</h2><p>${escapeHtml(body.message ?? "")}</p></div>`,
            text: `${body.title}\n\n${body.message ?? ""}`,
          });
          delivery.email = error
            ? { success: false, error: error.message }
            : { success: true, id: data?.id };
        } catch (error) {
          delivery.email = { success: false, error: error instanceof Error ? error.message : "Unknown email error" };
        }
      }
    }

    if (channels.includes("sms")) {
      if (!body.smsTo) {
        delivery.sms = { success: false, error: "Missing smsTo" };
      } else if (!twilioAccountSid || !twilioAuthToken || !twilioPhone) {
        delivery.sms = { success: false, error: "Twilio not configured" };
      } else {
        try {
          const client = twilio(twilioAccountSid, twilioAuthToken);
          const message = await client.messages.create({
            from: twilioPhone,
            to: body.smsTo,
            body: `${body.title}${body.message ? `: ${body.message}` : ""}`,
          });
          delivery.sms = { success: true, sid: message.sid };
        } catch (error) {
          delivery.sms = { success: false, error: error instanceof Error ? error.message : "Unknown SMS error" };
        }
      }
    }

    if (channels.includes("push")) {
      delivery.push = { success: false, error: "Push provider not configured" };
    }

    return NextResponse.json({ ok: true, delivery });
  } catch (error) {
    console.error("Failed to send notification", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
