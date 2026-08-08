import { NextResponse } from "next/server";
import { assertRateLimit } from "@/app/_lib/security";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import {
  REFERRAL_COOKIE_MAX_AGE_SECONDS,
  REFERRAL_COOKIE_NAME,
  normalizeReferralCode,
} from "@/lib/referrals";

async function referralCodeExists(referralCode: string) {
  const admin = createSupabaseAdminClient();
  const query = (admin.from as unknown as (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { id?: string } | null; error: { message: string } | null }>;
      };
    };
  })("referral_codes");

  const { data, error } = await query
    .select("id")
    .eq("code", referralCode)
    .maybeSingle();

  if (error) {
    console.error("[referrals/capture] referral lookup failed:", error.message);
    return false;
  }

  return Boolean(data?.id);
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "referral-capture", { limit: 30, windowMs: 60_000 });

    const body = await request.json().catch(() => ({}));
    const referralCode = normalizeReferralCode(body.referralCode);

    if (!referralCode || !(await referralCodeExists(referralCode))) {
      return NextResponse.json({ ok: false, error: "Invalid referral code." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(REFERRAL_COOKIE_NAME, referralCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "RouteError") {
      return NextResponse.json({ ok: false, error: error.message }, { status: 429 });
    }

    console.error("[referrals/capture] unexpected failure:", error);
    return NextResponse.json({ ok: false, error: "Unable to capture referral." }, { status: 500 });
  }
}
