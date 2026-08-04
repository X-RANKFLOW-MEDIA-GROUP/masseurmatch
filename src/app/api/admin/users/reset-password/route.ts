export const dynamic = "force-dynamic";

import React from "react";
import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { sendEmail } from "@/app/api/_lib/email";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";

const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    assertRateLimit(request, "admin-password-reset", { limit: 10, windowMs: 60_000 });
    const body = await parseJsonBody(request, resetPasswordSchema);
    const supabase = createSupabaseAdminClient();

    const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(body.userId);
    if (userError || !userResult.user?.email) {
      throw new RouteError(404, "User email could not be found.");
    }

    const requestUrl = new URL(request.url);
    const redirectTo = new URL("/reset-password", requestUrl.origin).toString();
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: userResult.user.email,
      options: { redirectTo },
    });

    const tokenHash = data?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      throw new RouteError(500, linkError?.message || "Could not generate a reset link.");
    }

    const resetUrl = new URL("/reset-password", requestUrl.origin);
    resetUrl.searchParams.set("token_hash", tokenHash);
    resetUrl.searchParams.set("type", "recovery");

    const sent = await sendEmail({
      to: userResult.user.email,
      subject: "Reset your MasseurMatch password",
      react: React.createElement(ResetPasswordEmail, {
        resetUrl: resetUrl.toString(),
      }),
    });

    if (!sent.success) {
      throw new RouteError(502, "The reset email could not be sent.");
    }

    await recordAuditLog(admin.userId, "send_password_reset", "user", body.userId, {
      email: userResult.user.email,
    });

    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
