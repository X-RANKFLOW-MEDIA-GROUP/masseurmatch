import { json } from "@/app/api/_lib/http";

export async function POST() {
  return json(
    {
      ok: false,
      error: "This MFA endpoint has been retired. Administrators must use native Supabase TOTP at /admin-mfa.",
      code: "MFA_ENDPOINT_RETIRED",
    },
    { status: 410 },
  );
}
