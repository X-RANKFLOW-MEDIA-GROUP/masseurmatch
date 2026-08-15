import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  UnsubscribeTokenConfigurationError,
  verifyUnsubscribeToken,
} from "@/app/api/_lib/unsubscribe-token";
import { createSupabaseWebhookAdminClient } from "@/app/api/_lib/supabase-server";

const schema = z.object({
  token: z.string().trim().min(1).max(4096),
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "email-unsubscribe", { limit: 30, windowMs: 60_000 });
    const { token } = await parseJsonBody(request, schema);

    let userId: string;
    try {
      ({ userId } = await verifyUnsubscribeToken(token));
    } catch (error) {
      if (error instanceof UnsubscribeTokenConfigurationError) {
        console.error("[Unsubscribe] Token configuration error:", error.message);
        throw new RouteError(503, "Unsubscribe service is temporarily unavailable.");
      }
      throw new RouteError(401, "Invalid or expired unsubscribe link.");
    }

    if (!UUID_RE.test(userId)) {
      throw new RouteError(401, "Invalid or expired unsubscribe link.");
    }

    const adminClient = createSupabaseWebhookAdminClient();
    const { data: existing, error: fetchError } = await (adminClient
      .from("marketing_preferences" as any)
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle() as any);

    if (fetchError) {
      console.error("[Unsubscribe] Database fetch error:", fetchError.message || fetchError);
      throw new RouteError(500, "Failed to retrieve email preferences.");
    }

    if (existing) {
      const { error: updateError } = await (adminClient
        .from("marketing_preferences" as any)
        .update({
          marketing_opt_in: false,
          newsletter_opt_in: false,
          updated_at: new Date().toISOString(),
          updated_by: "unsubscribe-link",
        })
        .eq("user_id", userId) as any);

      if (updateError) {
        console.error("[Unsubscribe] Database update error:", updateError.message || updateError);
        throw new RouteError(500, "Failed to update preferences.");
      }
    } else {
      const { error: insertError } = await (adminClient
        .from("marketing_preferences" as any)
        .insert({
          user_id: userId,
          marketing_opt_in: false,
          newsletter_opt_in: false,
          updated_by: "unsubscribe-link",
        }) as any);

      if (insertError) {
        console.error("[Unsubscribe] Database insert error:", insertError.message || insertError);
        throw new RouteError(500, "Failed to update preferences.");
      }
    }

    return json(
      {
        success: true,
        message: "Successfully unsubscribed from marketing emails.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
