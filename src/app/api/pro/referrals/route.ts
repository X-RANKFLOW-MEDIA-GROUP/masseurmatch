import { errorResponse, json } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

const rpc = async <T>(
  client: ReturnType<typeof createSupabaseAdminClient>,
  functionName: string,
  args: Record<string, unknown>,
) => {
  const { data, error } = await (client.rpc as unknown as (
    name: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: T; error: { message: string } | null }>)(functionName, args);

  if (error) throw new Error(error.message);
  return data;
};

type ReferralDashboardPayload = {
  summary?: Record<string, unknown> | null;
  referrals?: Array<Record<string, unknown> | null> | null;
};

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const supabase = createSupabaseAdminClient();

    await rpc<boolean>(supabase, "expire_referral_bonus_for_user", {
      p_user_id: session.userId,
    });

    const dashboard = await rpc<ReferralDashboardPayload>(supabase, "get_referral_dashboard", {
      p_user_id: session.userId,
    });

    const summary = dashboard.summary ?? {};
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com").replace(/\/$/, "");
    const code = typeof summary.code === "string" ? summary.code : "";

    return json({
      ok: true,
      summary: {
        ...summary,
        referralLink: code ? `${appUrl}/signup?ref=${encodeURIComponent(code)}` : null,
      },
      referrals: Array.isArray(dashboard.referrals) ? dashboard.referrals : [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
