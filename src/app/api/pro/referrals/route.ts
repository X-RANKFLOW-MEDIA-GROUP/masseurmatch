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

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const supabase = createSupabaseAdminClient();

    await rpc<boolean>(supabase, "expire_referral_bonus_for_user", {
      p_user_id: session.userId,
    });

    const summary = await rpc<Record<string, unknown>>(supabase, "get_referral_summary", {
      p_user_id: session.userId,
    });

    const { data: signups, error: signupsError } = await supabase
      .from("referral_signups")
      .select("id, payment_status, reward_months, paid_at, created_at")
      .eq("referrer_user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(25);

    if (signupsError) throw signupsError;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com").replace(/\/$/, "");
    const code = typeof summary?.code === "string" ? summary.code : "";

    return json({
      ok: true,
      summary: {
        ...summary,
        referralLink: code ? `${appUrl}/signup?ref=${encodeURIComponent(code)}` : null,
      },
      referrals: signups ?? [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
