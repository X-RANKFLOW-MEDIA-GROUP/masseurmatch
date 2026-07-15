import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { requireSession } from "@/app/api/_lib/supabase-server";
import { createSupabaseWebhookAdminClient } from "@/app/api/_lib/supabase-server";
import { verifyTotp } from "@/app/api/_lib/totp";
import { RouteError } from "@/app/api/_lib/http";
import { z } from "zod";

const mfaVerifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only digits"),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = await parseJsonBody(request, mfaVerifySchema);
    const adminClient = createSupabaseWebhookAdminClient();

    // Retrieve pending MFA setup
    const { data: pending, error: pendingError } = await adminClient
      .from("mfa_pending")
      .select("totp_secret, backup_codes")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pendingError || !pending) {
      throw new RouteError(400, "No pending MFA setup found. Start setup first.");
    }

    // Verify TOTP code
    if (!verifyTotp(pending.totp_secret, body.code)) {
      throw new RouteError(401, "Invalid verification code.");
    }

    // Enable MFA for user
    await adminClient.from("user_mfa").upsert({
      user_id: session.userId,
      totp_secret: pending.totp_secret,
      backup_codes: pending.backup_codes,
      enabled_at: new Date().toISOString(),
    });

    // Remove pending setup
    await adminClient.from("mfa_pending").delete().eq("user_id", session.userId);

    return json({
      ok: true,
      message: "MFA enabled successfully. Save your backup codes in a secure place.",
      backupCodes: pending.backup_codes,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return json({ ok: false, error: error.message }, { status: error.status });
    }
    return errorResponse(error);
  }
}
