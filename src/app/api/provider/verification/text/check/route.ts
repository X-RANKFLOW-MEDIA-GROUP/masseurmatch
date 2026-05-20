import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const checkSchema = z.object({
  phone: z.string().min(7).max(20),
  token: z.string().min(4).max(10),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = await parseJsonBody(request, checkSchema);
    const adminClient = createSupabaseAdminClient();

    // Get the latest pending verification for this user
    const { data: verification, error: fetchError } = await adminClient
      .from("text_verifications")
      .select("id, verification_code, expires_at")
      .eq("user_id", session.userId)
      .eq("phone", body.phone)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !verification) {
      throw new RouteError(400, "No pending verification found for this phone number.");
    }

    // Check expiry
    if (!verification.expires_at || new Date(verification.expires_at) < new Date()) {
      await adminClient
        .from("text_verifications")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", verification.id);
      throw new RouteError(400, "Verification code has expired.");
    }

    // Check code
    if (verification.verification_code !== body.token) {
      throw new RouteError(400, "Invalid verification code.");
    }

    const now = new Date().toISOString();

    // Mark as verified
    await adminClient
      .from("text_verifications")
      .update({ status: "verified", verified_at: now, updated_at: now })
      .eq("id", verification.id);

    // Update profile phone verification flag
    await adminClient
      .from("profiles")
      .update({ 
        is_verified_phone: true, 
        phone: body.phone,
        updated_at: now 
      })
      .eq("user_id", session.userId);

    return json({ ok: true, status: "verified" });
  } catch (error) {
    return errorResponse(error);
  }
}
