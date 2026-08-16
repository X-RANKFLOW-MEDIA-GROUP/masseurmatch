import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { assertRateLimit } from "@/app/_lib/security";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

function normalizePhone(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "provider-phone-sync", { limit: 10, windowMs: 60_000 });

    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient.auth.admin.getUserById(session.userId);

    if (error || !data.user) {
      throw new RouteError(404, "Account not found.");
    }

    const phone = normalizePhone(data.user.phone);
    if (!phone || !data.user.phone_confirmed_at) {
      throw new RouteError(
        409,
        "Phone verification must be completed before the profile can use this number.",
        "PHONE_NOT_VERIFIED",
      );
    }

    const now = new Date().toISOString();
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        phone,
        phone_number: phone,
        is_verified_phone: true,
        updated_at: now,
      })
      .eq("user_id", session.userId);

    if (profileError) {
      throw new RouteError(500, "Phone was verified, but the profile could not be synchronized.");
    }

    return json({
      ok: true,
      phone,
      verifiedAt: data.user.phone_confirmed_at,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
