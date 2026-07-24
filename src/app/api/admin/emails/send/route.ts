export const dynamic = "force-dynamic";

import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import {
  renderAdminEmailTemplate,
  type AdminEmailCategory,
  type AdminEmailTemplateKey,
} from "@/lib/email/admin-templates";

const requestSchema = z.object({
  mode: z.enum(["test", "campaign"]),
  templateKey: z.literal("login-access-restored"),
  category: z.enum(["marketing", "transactional"]),
  subject: z.string().trim().min(3).max(180),
  audience: z.enum(["all-providers", "incomplete-profiles", "approved-profiles"]).optional(),
  testEmail: z.string().trim().email().optional(),
  loginUrl: z.string().trim().url().optional(),
  mailingAddress: z.string().trim().max(240).optional(),
});

type ProfileAudienceRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  email_address: string | null;
  display_name: string | null;
  full_name: string | null;
  role: string | null;
  profile_status: string | null;
  completion_percentage: number | null;
  profile_completion_score: number | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
};

type Recipient = {
  userId: string | null;
  email: string;
  name: string;
};

function getEmail(row: ProfileAudienceRow) {
  return (row.email_address || row.email || "").trim().toLowerCase();
}

function isProvider(row: ProfileAudienceRow) {
  return ["provider", "therapist", "masseur"].includes((row.role || "").toLowerCase());
}

function isIncomplete(row: ProfileAudienceRow) {
  const score = row.profile_completion_score ?? row.completion_percentage ?? 0;
  return row.profile_status !== "approved" || score < 100;
}

async function resolveRecipients(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  input: z.infer<typeof requestSchema>,
): Promise<Recipient[]> {
  if (input.mode === "test") {
    if (!input.testEmail) throw new RouteError(400, "Test email is required.");
    return [{ userId: null, email: input.testEmail.toLowerCase(), name: "Test recipient" }];
  }

  if (!input.audience) throw new RouteError(400, "Audience is required.");

  const { data, error } = await adminClient
    .from("profiles")
    .select(
      "id,user_id,email,email_address,display_name,full_name,role,profile_status,completion_percentage,profile_completion_score,is_banned,is_suspended",
    )
    .limit(5000);

  if (error) throw new RouteError(500, error.message);

  const recipients = ((data ?? []) as ProfileAudienceRow[])
    .filter(isProvider)
    .filter((row) => !row.is_banned && !row.is_suspended)
    .filter((row) => Boolean(getEmail(row)))
    .filter((row) => {
      if (input.audience === "incomplete-profiles") return isIncomplete(row);
      if (input.audience === "approved-profiles") return row.profile_status === "approved";
      return true;
    })
    .map((row) => ({
      userId: row.user_id,
      email: getEmail(row),
      name: row.display_name || row.full_name || getEmail(row).split("@")[0] || "there",
    }));

  return Array.from(new Map(recipients.map((recipient) => [recipient.email, recipient])).values());
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-email-send", { limit: 8, windowMs: 60_000 });
    const input = await parseJsonBody(request, requestSchema);
    const adminClient = createSupabaseAdminClient();
    const recipients = await resolveRecipients(adminClient, input);

    if (recipients.length === 0) throw new RouteError(400, "No eligible recipients were found.");
    if (recipients.length > 5000) throw new RouteError(400, "Campaign exceeds the 5,000 recipient safety limit.");

    const campaignKey = `admin-${input.templateKey}-${Date.now()}`;
    const scheduledFor = new Date().toISOString();
    const rows = recipients.map((recipient) => {
      const rendered = renderAdminEmailTemplate({
        templateKey: input.templateKey as AdminEmailTemplateKey,
        category: input.category as AdminEmailCategory,
        subject: input.subject,
        firstName: recipient.name,
        loginUrl: input.loginUrl,
        mailingAddress: input.mailingAddress,
      });

      return {
        user_id: recipient.userId,
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        segment: input.mode === "test" ? "admin_test" : input.audience,
        campaign_key: campaignKey,
        flow_key: "admin_email_center",
        template_key: input.templateKey,
        send_category: input.category,
        subject: rendered.subject,
        body_html: rendered.html,
        body_text: rendered.text,
        scheduled_for: scheduledFor,
        status: "queued",
        idempotency_key: `${campaignKey}:${recipient.email}`,
      };
    });

    for (const batch of chunks(rows, 200)) {
      const { error } = await adminClient.from("lifecycle_email_queue").insert(batch);
      if (error) throw new RouteError(500, error.message);
    }

    let workerTriggered = false;
    try {
      const { error } = await adminClient.rpc("run_lifecycle_queue_worker");
      workerTriggered = !error;
    } catch {
      workerTriggered = false;
    }

    await recordAuditLog(admin.userId, "queue_admin_email_campaign", "email_campaign", campaignKey, {
      mode: input.mode,
      audience: input.audience ?? "test",
      templateKey: input.templateKey,
      category: input.category,
      recipientCount: recipients.length,
      workerTriggered,
    });

    return json({
      ok: true,
      campaignKey,
      queued: recipients.length,
      workerTriggered,
      message: workerTriggered
        ? "Campaign queued and delivery worker triggered."
        : "Campaign queued. The scheduled worker will deliver it shortly.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
