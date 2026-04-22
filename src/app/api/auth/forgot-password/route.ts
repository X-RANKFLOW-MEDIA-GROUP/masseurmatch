import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { forgotPasswordSchema } from "@/app/_lib/validation";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, forgotPasswordSchema);
    try {
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
        redirectTo: `${new URL(request.url).origin}${body.redirectTo || "/reset-password"}`,
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
