import React from "react";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";
import { forgotPasswordSchema } from "@/app/_lib/validation";
import { verifyCsrfToken, extractCsrfToken } from "@/app/api/_lib/csrf";
import { sendEmail } from "@/app/api/_lib/email";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";

const DEFAULT_RESET_PATH = "/reset-password";

export async function POST(request: Request) {
  try {
    // Prevent password-reset email bombing per IP.
    assertRateLimit(request, "auth-forgot-password", { limit: 5, windowMs: 60_000 });

    // Validate CSRF token
    const csrfData = extractCsrfToken(request.headers);
    if (!csrfData || !verifyCsrfToken(csrfData.token, csrfData.cookieValue)) {
      throw new RouteError(403, "Invalid security token. Please try again.", "CSRF_INVALID");
    }

    const body = await parseJsonBody(request, forgotPasswordSchema);
    try {
      const supabase = createSupabaseAdminClient();
      const requestUrl = new URL(request.url);
      const redirectPath = body.redirectTo || DEFAULT_RESET_PATH;
      let redirectTo = new URL(DEFAULT_RESET_PATH, requestUrl.origin).toString();

      if (/^https?:\/\//i.test(redirectPath)) {
        try {
          const externalUrl = new URL(redirectPath);
          if (externalUrl.origin === requestUrl.origin) {
            redirectTo = externalUrl.toString();
          }
        } catch {
          // Keep the default safe redirect.
        }
      } else {
        redirectTo = new URL(redirectPath, requestUrl.origin).toString();
      }

      // Preferred path: mint the recovery grant ourselves and email a
      // token_hash link that /reset-password verifies client-side. This avoids
      // two failure modes of the default resetPasswordForEmail + Supabase
      // template flow:
      //   1. The single-use /auth/v1/verify URL being consumed by email
      //      link-scanners (Outlook Safe Links, antivirus) → "token expired".
      //   2. PKCE ?code links that need a code_verifier the browser never got
      //      (the email is sent server-side) → "Auth session missing!" on save.
      // token_hash + verifyOtp needs no code_verifier and is scanner-safe.
      let emailedViaTokenHash = false;
      if (process.env.RESEND_API_KEY) {
        try {
          const { data, error: linkError } = await supabase.auth.admin.generateLink({
            type: "recovery",
            email: body.email,
            options: { redirectTo },
          });
          const tokenHash = data?.properties?.hashed_token;
          if (!linkError && tokenHash) {
            const resetUrl = new URL(DEFAULT_RESET_PATH, requestUrl.origin);
            resetUrl.searchParams.set("token_hash", tokenHash);
            resetUrl.searchParams.set("type", "recovery");
            const sent = await sendEmail({
              to: body.email,
              subject: "Reset your MasseurMatch password",
              react: React.createElement(ResetPasswordEmail, {
                resetUrl: resetUrl.toString(),
              }),
            });
            emailedViaTokenHash = sent.success;
          } else if (linkError) {
            // Non-existent account etc. — stay generic to avoid enumeration.
            console.warn("[forgot-password] generateLink skipped:", linkError.message);
          }
        } catch (linkErr) {
          console.error(
            "[forgot-password] token_hash email failed, falling back:",
            linkErr instanceof Error ? linkErr.message : String(linkErr),
          );
        }
      }

      // Fallback: Supabase's built-in reset email (used when Resend isn't
      // configured or link minting failed for a real account).
      if (!emailedViaTokenHash) {
        const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
          redirectTo,
        });
        if (error) {
          // Still return a generic success to prevent email enumeration.
          console.error("Password reset error:", error.message);
        }
      }
    } catch (error) {
      // Keep route stable for local/test environments that do not provide Supabase admin keys.
      const message = error instanceof Error ? error.message : String(error);
      console.error("Password reset skipped:", message);
    }

    return json({
      ok: true,
      message: "If an account exists for that email, a password reset link will be sent.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
