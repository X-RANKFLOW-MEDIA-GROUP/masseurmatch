import { createHash } from "node:crypto";
import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  assertRateLimit,
  getClientIp,
  sanitizeOptionalText,
  sanitizeText,
} from "@/app/_lib/security";
import { getRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import type { TablesInsert } from "@/integrations/supabase/types";

export const dynamic = "force-dynamic";

const REPORT_CATEGORIES = [
  "sexual_solicitation",
  "trafficking",
  "prohibited_content",
  "csam",
  "fake_or_stolen",
  "harassment_safety",
  "other",
] as const;

const reportSchema = z.object({
  profileId: z.string().uuid(),
  profileSlug: z.string().max(200).optional(),
  profileName: z.string().max(200).optional(),
  category: z.enum(REPORT_CATEGORIES),
  reason: z.string().min(10).max(2000),
  reporterEmail: z.string().email().max(320).optional().or(z.literal("")),
});

function hashIp(request: Request) {
  const ip = getClientIp(request);
  if (!ip || ip === "local") {
    return null;
  }
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function POST(request: Request) {
  try {
    // Reporting must stay frictionless (FOSTA-SESTA), but abuse-proof.
    assertRateLimit(request, "report-profile", { limit: 6, windowMs: 60_000 });

    const body = await parseJsonBody(request, reportSchema);
    const adminClient = createSupabaseAdminClient();

    // Confirm the reported profile exists before recording a report.
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", body.profileId)
      .maybeSingle();

    if (profileError) {
      throw new RouteError(500, profileError.message);
    }
    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    // Attribute to a logged-in reporter when we have one; anonymous is allowed.
    const session = getRequestSession(request);
    const reporterEmail = body.reporterEmail ? sanitizeOptionalText(body.reporterEmail) : null;

    const payload: TablesInsert<"profile_reports"> = {
      profile_id: body.profileId,
      profile_slug: sanitizeOptionalText(body.profileSlug),
      profile_name: sanitizeOptionalText(body.profileName),
      category: body.category,
      reason: sanitizeText(body.reason),
      reporter_email: reporterEmail,
      reporter_user_id: session?.userId ?? null,
      ip_hash: hashIp(request),
      status: "open",
    };

    const { error: insertError } = await adminClient.from("profile_reports").insert(payload);

    if (insertError) {
      throw new RouteError(500, insertError.message);
    }

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
