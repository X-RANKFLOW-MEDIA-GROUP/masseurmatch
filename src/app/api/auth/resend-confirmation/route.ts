import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { createSupabasePublicClient } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";
import { z } from "zod";

const resendSchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    // Prevent confirmation email bombing per IP.
    assertRateLimit(request, "auth-resend-confirmation", { limit: 5, windowMs: 60_000 });
    const { email } = await parseJsonBody(request, resendSchema);
    const { origin } = new URL(request.url);
    const client = createSupabasePublicClient();

    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/signup/plan`,
      },
    });

    if (error) {
      console.warn("[auth.resend-confirmation] resend failed", { message: error.message });
      return json({ ok: false, error: "Could not resend confirmation email." }, { status: 400 });
    }

    return json({ ok: true, message: "Confirmation email sent." });
  } catch (error) {
    return errorResponse(error);
  }
}
