import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";
import type { Json } from "@/integrations/supabase/types";

const MAX_RECIPIENTS = 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FROM = new Set([
  "MasseurMatch Support <support@masseurmatch.com>",
  "MasseurMatch <notifications@masseurmatch.com>",
  "MasseurMatch Updates <updates@masseurmatch.com>",
]);

type Payload = {
  recipients?: string[];
  subject?: string;
  html?: string;
  from?: string;
  replyTo?: string;
};

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession(request);
    const body = (await request.json()) as Payload;
    const recipients = Array.from(new Set((body.recipients || []).map((item) => item.trim().toLowerCase())));
    const subject = body.subject?.trim() || "";
    const html = body.html?.trim() || "";
    const requestedFrom = body.from?.trim() || "";
    const from = ALLOWED_FROM.has(requestedFrom)
      ? requestedFrom
      : process.env.RESEND_FROM_EMAIL || "MasseurMatch <notifications@masseurmatch.com>";
    const replyTo = body.replyTo?.trim() || "support@masseurmatch.com";

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 500 });
    }
    if (recipients.length === 0 || recipients.length > MAX_RECIPIENTS) {
      return NextResponse.json({ error: `Choose between 1 and ${MAX_RECIPIENTS} recipients.` }, { status: 400 });
    }
    if (recipients.some((email) => !EMAIL_RE.test(email)) || !EMAIL_RE.test(replyTo)) {
      return NextResponse.json({ error: "One or more email addresses are invalid." }, { status: 400 });
    }
    if (!subject || subject.length > 180) {
      return NextResponse.json({ error: "Subject is required and must be 180 characters or fewer." }, { status: 400 });
    }
    if (!html || html.length > 100_000) {
      return NextResponse.json({ error: "Email content is required and is too large." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const resend = new Resend(process.env.RESEND_API_KEY);
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (const email of recipients) {
      const user = await findUserByEmail(supabase, email);
      const name = user?.user_metadata?.display_name || user?.user_metadata?.full_name || "there";
      const personalizedHtml = html.replaceAll("{{name}}", escapeHtml(String(name)));
      const personalizedText = stripHtml(personalizedHtml);
      const sendResult = await resend.emails.send({
        from,
        to: email,
        replyTo,
        subject,
        html: personalizedHtml,
        text: personalizedText,
      });

      const success = !sendResult.error;
      results.push({ email, success, error: sendResult.error?.message });

      if (user) {
        await supabase.from("notification_deliveries").insert({
          notification_id: null,
          user_id: user.id,
          channel: "email",
          provider: "resend",
          provider_message_id: sendResult.data?.id ?? null,
          destination: email,
          status: success ? "sent" : "failed",
          error_message: sendResult.error?.message ?? null,
          payload: { source: "admin_email_center", subject, from, reply_to: replyTo } as Json,
        });
      }
    }

    const sent = results.filter((item) => item.success).length;
    const failed = results.length - sent;
    await recordAuditLog(session.userId, "admin_email_send", "email_campaign", undefined, {
      subject,
      from,
      reply_to: replyTo,
      recipient_count: recipients.length,
      sent,
      failed,
    } as Json);

    return NextResponse.json({ success: failed === 0, sent, failed, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send email";
    const status = message.includes("Authentication") ? 401 : message.includes("Admin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function findUserByEmail(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
) {
  let page = 1;
  while (page > 0) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const match = (data.users || []).find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    page = data.nextPage || 0;
  }
  return null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
