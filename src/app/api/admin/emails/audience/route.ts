export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

type AudienceKey = "all-providers" | "incomplete-profiles" | "approved-profiles";

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

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);

    const audience = (new URL(request.url).searchParams.get("audience") || "all-providers") as AudienceKey;
    if (!["all-providers", "incomplete-profiles", "approved-profiles"].includes(audience)) {
      throw new RouteError(400, "Invalid audience.");
    }

    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select(
        "id,user_id,email,email_address,display_name,full_name,role,profile_status,completion_percentage,profile_completion_score,is_banned,is_suspended",
      )
      .limit(5000);

    if (error) throw new RouteError(500, error.message);

    const rows = (data ?? []) as ProfileAudienceRow[];
    const recipients = rows
      .filter(isProvider)
      .filter((row) => !row.is_banned && !row.is_suspended)
      .filter((row) => Boolean(getEmail(row)))
      .filter((row) => {
        if (audience === "incomplete-profiles") return isIncomplete(row);
        if (audience === "approved-profiles") return row.profile_status === "approved";
        return true;
      })
      .map((row) => ({
        profileId: row.id,
        userId: row.user_id,
        email: getEmail(row),
        name: row.display_name || row.full_name || getEmail(row).split("@")[0] || "there",
        profileStatus: row.profile_status,
        completionScore: row.profile_completion_score ?? row.completion_percentage ?? null,
      }));

    const unique = Array.from(new Map(recipients.map((recipient) => [recipient.email, recipient])).values());

    return json({
      ok: true,
      audience,
      count: unique.length,
      sample: unique.slice(0, 12),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
