import { NextResponse } from "next/server";

const REFERRAL_CODE_RE = /^REF[A-F0-9]{10}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const referralCode = typeof body.referralCode === "string"
    ? body.referralCode.trim().toUpperCase()
    : "";

  if (!REFERRAL_CODE_RE.test(referralCode)) {
    return NextResponse.json({ ok: false, error: "Invalid referral code." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("mm_referral_code", referralCode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
