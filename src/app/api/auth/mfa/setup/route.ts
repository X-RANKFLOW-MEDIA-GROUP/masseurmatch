import { errorResponse, json, withSetCookie } from "@/app/api/_lib/http";
import { requireSession } from "@/app/api/_lib/supabase-server";
import { createSupabaseWebhookAdminClient } from "@/app/api/_lib/supabase-server";
import { generateTotpSecret, generateTotpUri, generateBackupCodes } from "@/app/api/_lib/totp";
import { RouteError } from "@/app/api/_lib/http";

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseWebhookAdminClient();

    // Generate new TOTP secret
    const secret = generateTotpSecret();
    const uri = generateTotpUri(secret, session.email);
    const backupCodes = generateBackupCodes();

    // Store MFA setup in progress (expires in 15 minutes)
    await adminClient.from("mfa_pending" as any).insert({
      user_id: session.userId,
      totp_secret: secret,
      backup_codes: backupCodes,
      expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    } as any);

    return json({
      ok: true,
      secret,
      uri,
      backupCodes,
      message: "Scan the QR code with your authenticator app, then verify with a code.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
