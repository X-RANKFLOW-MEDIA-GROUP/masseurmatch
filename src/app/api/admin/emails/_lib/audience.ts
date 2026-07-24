import { RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminDashboardClient } from "@/app/api/_lib/supabase-server";

export type AudienceKey = "all-providers" | "incomplete-profiles" | "approved-profiles";

export type AdminEmailRecipient = {
  profileId: string;
  userId: string | null;
  email: string;
  name: string;
  profileStatus: string | null;
  completionScore: number | null;
};

type ProfileAudienceRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  email_address: string | null;
  display_name: string | null;
  full_name: string | null;
  role: string;
  profile_status: string | null;
  completion_percentage: number | null;
  profile_completion_score: number | null;
  is_banned: boolean | null;
  is_suspended: boolean | null;
  is_demo: boolean;
};

type AdminClient = ReturnType<typeof createSupabaseAdminDashboardClient>;

const PAGE_SIZE = 1_000;
const MAX_PROFILES_SCANNED = 10_000;

const PROFILE_FIELDS =
  "id,user_id,email,email_address,display_name,full_name,role,profile_status,completion_percentage,profile_completion_score,is_banned,is_suspended,is_demo";

function getEmail(row: ProfileAudienceRow) {
  return (row.email_address || row.email || "").trim().toLowerCase();
}

function isProvider(row: ProfileAudienceRow) {
  return ["provider", "therapist", "masseur"].includes(row.role.toLowerCase());
}

function isIncomplete(row: ProfileAudienceRow) {
  const score = row.profile_completion_score ?? row.completion_percentage ?? 0;
  return row.profile_status !== "approved" || score < 100;
}

async function fetchProfiles(client: AdminClient) {
  const rows: ProfileAudienceRow[] = [];

  for (let from = 0; from < MAX_PROFILES_SCANNED; from += PAGE_SIZE) {
    const { data, error } = await client
      .from("profiles")
      .select(PROFILE_FIELDS)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new RouteError(500, error.message);

    const page = (data ?? []) as ProfileAudienceRow[];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
  }

  return rows;
}

export async function resolveAudienceRecipients(client: AdminClient, audience: AudienceKey) {
  const rows = await fetchProfiles(client);

  const recipients = rows
    .filter(isProvider)
    .filter((row) => !row.is_demo && !row.is_banned && !row.is_suspended)
    .filter((row) => Boolean(getEmail(row)))
    .filter((row) => {
      if (audience === "incomplete-profiles") return isIncomplete(row);
      if (audience === "approved-profiles") return row.profile_status === "approved";
      return true;
    })
    .map<AdminEmailRecipient>((row) => ({
      profileId: row.id,
      userId: row.user_id,
      email: getEmail(row),
      name: row.display_name || row.full_name || getEmail(row).split("@")[0] || "there",
      profileStatus: row.profile_status,
      completionScore: row.profile_completion_score ?? row.completion_percentage ?? null,
    }));

  return Array.from(new Map(recipients.map((recipient) => [recipient.email, recipient])).values());
}
