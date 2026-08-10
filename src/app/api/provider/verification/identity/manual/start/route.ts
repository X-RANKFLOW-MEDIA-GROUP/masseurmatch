import { randomInt, randomUUID } from "node:crypto";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Provider profile not found.");

    const now = new Date().toISOString();

    // Only one active manual attempt should be authoritative at a time.
    await admin
      .from("identity_verifications")
      .update({ status: "canceled", updated_at: now })
      .eq("user_id", session.userId)
      .eq("provider", "manual")
      .in("status", ["not_started", "pending"]);

    const verificationId = randomUUID();
    const challengeCode = String(randomInt(100000, 1000000));
    const metadata = {
      manual: {
        version: 1,
        challengeCode,
        files: {},
        submittedAt: null,
        reviewedAt: null,
        documentsDeletedAt: null,
      },
    };

    const { error: insertError } = await admin.from("identity_verifications").insert({
      id: verificationId,
      user_id: session.userId,
      profile_id: profile.id,
      provider: "manual",
      status: "not_started",
      last_error: null,
      metadata,
      updated_at: now,
    });

    if (insertError) throw new RouteError(500, insertError.message);

    return json({ ok: true, verificationId, challengeCode });
  } catch (error) {
    return errorResponse(error);
  }
}
