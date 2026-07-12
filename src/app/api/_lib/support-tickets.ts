import { z } from "zod";
import { Resend } from "resend";

import { envAny, envOptional } from "@/app/api/_lib/env";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export const TICKET_CATEGORIES = [
  "billing",
  "payouts",
  "technical",
  "profile",
  "verification",
  "account",
  "trust_safety",
  "other",
] as const;

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_on_user",
  "resolved",
  "closed",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  billing: "Billing",
  payouts: "Payouts",
  technical: "Technical issue",
  profile: "Profile & listing",
  verification: "Verification",
  account: "Account",
  trust_safety: "Trust & Safety",
  other: "Other",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_user: "Waiting on you",
  resolved: "Resolved",
  closed: "Closed",
};

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3, "Subject is too short.").max(160, "Subject is too long."),
  category: z.enum(TICKET_CATEGORIES).default("other"),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
  message: z.string().trim().min(1, "Please describe your issue.").max(8000, "Message is too long."),
});

export const replySchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty.").max(8000, "Message is too long."),
});

export const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
});

export interface RequesterInfo {
  name: string | null;
  email: string | null;
}

/**
 * Resolve a display name + email for the ticket requester from the profiles
 * table (falling back to the auth user record). Best-effort — returns nulls if
 * nothing can be found.
 */
export async function resolveRequesterInfo(userId: string): Promise<RequesterInfo> {
  const admin = createSupabaseAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, display_name, email, email_address")
    .eq("user_id", userId)
    .maybeSingle();

  let name = profile?.full_name || profile?.display_name || null;
  let email = profile?.email || profile?.email_address || null;

  if (!email || !name) {
    try {
      const { data } = await admin.auth.admin.getUserById(userId);
      email = email || data.user?.email || null;
      const metaName =
        (data.user?.user_metadata?.full_name as string | undefined) ??
        (data.user?.user_metadata?.name as string | undefined);
      name = name || metaName || null;
    } catch {
      // best effort
    }
  }

  return { name, email };
}

export function ticketAppUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://masseurmatch.com";
  return `${base}${path}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Let the provider know the support team replied to their ticket. Best-effort;
 * never throws so an email hiccup can't fail the admin's reply.
 */
export async function notifyProviderOfReply(input: {
  to: string | null | undefined;
  providerName: string | null | undefined;
  subject: string;
  body: string;
  ticketId: string;
}): Promise<void> {
  if (!input.to) return;

  const apiKey = envOptional(["RESEND_API_KEY"]);
  if (!apiKey) {
    console.warn("[support-tickets] RESEND_API_KEY missing; skipping provider reply email.");
    return;
  }

  const from = envAny(["RESEND_FROM_EMAIL"], "MasseurMatch <notifications@masseurmatch.com>");
  const url = ticketAppUrl(`/pro/tickets?ticket=${input.ticketId}`);
  const greeting = input.providerName ? `Hi ${escapeHtml(input.providerName.split(" ")[0])},` : "Hi,";

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#F7F7F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#8B1E2D 0%,#6E1521 100%);border-radius:12px 12px 0 0;padding:22px 24px;">
        <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700;">MasseurMatch Support replied</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #E8E8E8;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        <p style="margin:0 0 12px;font-size:15px;color:#111111;">${greeting}</p>
        <p style="margin:0 0 12px;font-size:15px;color:#6F6F6F;">Our team responded to your ticket <strong style="color:#111111;">"${escapeHtml(
          input.subject,
        )}"</strong>.</p>
        <div style="background:#F7F7F7;border:1px solid #E8E8E8;border-radius:10px;padding:16px;margin:16px 0;font-size:14px;line-height:1.6;color:#111111;white-space:pre-wrap;">${escapeHtml(
          input.body,
        )}</div>
        <p style="margin:24px 0 8px;"><a href="${url}" style="display:inline-block;background:#8B1E2D;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:8px;">View &amp; reply</a></p>
        <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E8E8E8;font-size:12px;color:#8E8E8E;">You're receiving this because you have an open support ticket with MasseurMatch.</p>
      </div>
    </div>
  </body>
</html>`;

  try {
    await new Resend(apiKey).emails.send({
      from,
      to: input.to,
      subject: `Re: ${input.subject}`,
      html,
    });
  } catch (error) {
    console.error("[support-tickets] provider reply email failed:", error);
  }
}
