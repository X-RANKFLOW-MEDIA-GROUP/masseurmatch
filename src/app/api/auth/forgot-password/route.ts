import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { createSupabasePublicClient } from "@/app/api/_lib/supabase-server";
import { forgotPasswordSchema } from "@/app/_lib/validation";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, forgotPasswordSchema);
    try {
      const supabase = createSupabasePublicClient();
      const requestUrl = new URL(request.url);
      const redirectPath = body.redirectTo || "/reset-password";
      let redirectTo = new URL("/reset-password", requestUrl.origin).toString();

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

      const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
        redirectTo,
      });

      if (error) {
        // Still return a generic success to prevent email enumeration
        console.error("Password reset error:", error.message);
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
