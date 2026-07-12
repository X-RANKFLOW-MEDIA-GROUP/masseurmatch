import { Resend } from "resend";

import { envAny, envOptional } from "@/app/api/_lib/env";

/**
 * Central place for "something needs an admin's attention" emails.
 *
 * Every event that is submitted to the admin team — a new support ticket, a
 * provider reply, a brand-new account, a profile submitted for review — funnels
 * through {@link notifyAdmin} so the destination address and branding stay
 * consistent. The recipient defaults to admin@xrankflow.com and can be
 * overridden with ADMIN_NOTIFICATION_EMAIL.
 */

const DEFAULT_ADMIN_RECIPIENT = "admin@xrankflow.com";
const DEFAULT_FROM = "MasseurMatch <notifications@masseurmatch.com>";

export function getAdminNotificationRecipient(): string {
  return (
    envOptional(["ADMIN_NOTIFICATION_EMAIL", "ADMIN_EMAIL"]) ?? DEFAULT_ADMIN_RECIPIENT
  );
}

export interface AdminNotificationField {
  label: string;
  value: string | null | undefined;
}

export interface AdminNotificationInput {
  /** Short summary used as the email subject (an "[Admin]" prefix is added). */
  subject: string;
  /** Headline shown at the top of the email body. */
  heading: string;
  /** Optional lead paragraph under the heading. */
  intro?: string;
  /** Key/value rows rendered as a summary table. */
  fields?: AdminNotificationField[];
  /** Optional freeform block (e.g. the message the user wrote). */
  message?: string | null;
  /** Optional call-to-action button. */
  action?: { label: string; url: string };
  /** Optional reply-to (e.g. the provider's email) so admins can respond. */
  replyTo?: string | null;
}

export interface AdminNotificationResult {
  ok: boolean;
  id?: string;
  mock?: boolean;
  error?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAdminEmail(input: AdminNotificationInput): string {
  const rows = (input.fields ?? [])
    .filter((field) => field.value != null && String(field.value).trim() !== "")
    .map(
      (field) => `
        <tr>
          <td style="padding:8px 12px;font-size:13px;color:#6F6F6F;white-space:nowrap;vertical-align:top;">${escapeHtml(field.label)}</td>
          <td style="padding:8px 12px;font-size:14px;color:#111111;font-weight:600;">${escapeHtml(String(field.value))}</td>
        </tr>`,
    )
    .join("");

  const table = rows
    ? `<table role="presentation" style="width:100%;border-collapse:collapse;background:#FAFAFA;border:1px solid #E8E8E8;border-radius:10px;margin:16px 0;">${rows}</table>`
    : "";

  const messageBlock = input.message?.trim()
    ? `<div style="background:#F7F7F7;border:1px solid #E8E8E8;border-radius:10px;padding:16px;margin:16px 0;font-size:14px;line-height:1.6;color:#111111;white-space:pre-wrap;">${escapeHtml(
        input.message.trim(),
      )}</div>`
    : "";

  const introBlock = input.intro
    ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#6F6F6F;">${escapeHtml(input.intro)}</p>`
    : "";

  const actionBlock = input.action
    ? `<p style="margin:24px 0 8px;"><a href="${input.action.url}" style="display:inline-block;background:#8B1E2D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px;">${escapeHtml(
        input.action.label,
      )}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#F7F7F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#111111;border-radius:12px 12px 0 0;padding:20px 24px;">
        <span style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8E8E8E;font-family:monospace;">MasseurMatch · Admin Alert</span>
        <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">${escapeHtml(input.heading)}</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #E8E8E8;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        ${introBlock}
        ${table}
        ${messageBlock}
        ${actionBlock}
        <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E8E8E8;font-size:12px;color:#8E8E8E;">
          Automated notification from MasseurMatch. Sent to ${escapeHtml(getAdminNotificationRecipient())}.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

let _resend: Resend | null = null;
function getResend(apiKey: string): Resend {
  if (!_resend) {
    _resend = new Resend(apiKey);
  }
  return _resend;
}

/**
 * Best-effort admin notification. Never throws — callers should not fail their
 * primary operation (creating a ticket, registering a user) if email delivery
 * hiccups. Returns a result object so callers can log outcomes.
 */
export async function notifyAdmin(
  input: AdminNotificationInput,
): Promise<AdminNotificationResult> {
  const to = getAdminNotificationRecipient();
  const apiKey = envOptional(["RESEND_API_KEY"]);

  if (!apiKey) {
    console.warn("[admin-notify] RESEND_API_KEY missing; skipping admin email:", input.subject);
    return { ok: false, mock: true };
  }

  const from = envAny(["RESEND_FROM_EMAIL"], DEFAULT_FROM);

  try {
    const result = await getResend(apiKey).emails.send({
      from,
      to,
      subject: `[Admin] ${input.subject}`,
      html: renderAdminEmail(input),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    if (result.error) {
      console.error("[admin-notify] Resend error:", result.error);
      return { ok: false, error: result.error.message };
    }

    return { ok: true, id: result.data?.id };
  } catch (error) {
    console.error("[admin-notify] Unexpected error:", error);
    return { ok: false, error: error instanceof Error ? error.message : "unknown" };
  }
}
