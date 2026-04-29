import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";

const patchSchema = z.object({
  requireIdentityVerification: z.boolean().optional(),
  requireTextVerification: z.boolean().optional(),
  requirePhotoReview: z.boolean().optional(),
  requireManualProfileReview: z.boolean().optional(),
  allowPublicProfiles: z.boolean().optional(),
  maxFreePhotos: z.number().int().min(0).max(50).optional(),
  maxStandardPhotos: z.number().int().min(0).max(50).optional(),
  maxProPhotos: z.number().int().min(0).max(50).optional(),
  maxElitePhotos: z.number().int().min(0).max(50).optional(),
  maintenanceMode: z.boolean().optional(),
  signupEnabled: z.boolean().optional(),
  supportEmail: z.string().email().optional(),
  billingEmail: z.string().email().optional(),
  legalEmail: z.string().email().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data, error } = await adminClient
      .from("site_settings")
      .select("*")
      .eq("id", "singleton")
      .single();

    if (error) throw new RouteError(500, error.message);

    return json({ ok: true, settings: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminSession(request);
    const body = await parseJsonBody(request, patchSchema);
    const adminClient = createSupabaseAdminClient();

    const updatePayload: Record<string, unknown> = {
      updated_by: admin.userId,
      updated_at: new Date().toISOString(),
    };

    if (body.requireIdentityVerification !== undefined)
      updatePayload.require_identity_verification = body.requireIdentityVerification;
    if (body.requireTextVerification !== undefined)
      updatePayload.require_text_verification = body.requireTextVerification;
    if (body.requirePhotoReview !== undefined)
      updatePayload.require_photo_review = body.requirePhotoReview;
    if (body.requireManualProfileReview !== undefined)
      updatePayload.require_manual_profile_review = body.requireManualProfileReview;
    if (body.allowPublicProfiles !== undefined)
      updatePayload.allow_public_profiles = body.allowPublicProfiles;
    if (body.maxFreePhotos !== undefined) updatePayload.max_free_photos = body.maxFreePhotos;
    if (body.maxStandardPhotos !== undefined) updatePayload.max_standard_photos = body.maxStandardPhotos;
    if (body.maxProPhotos !== undefined) updatePayload.max_pro_photos = body.maxProPhotos;
    if (body.maxElitePhotos !== undefined) updatePayload.max_elite_photos = body.maxElitePhotos;
    if (body.maintenanceMode !== undefined) updatePayload.maintenance_mode = body.maintenanceMode;
    if (body.signupEnabled !== undefined) updatePayload.signup_enabled = body.signupEnabled;
    if (body.supportEmail !== undefined) updatePayload.support_email = body.supportEmail;
    if (body.billingEmail !== undefined) updatePayload.billing_email = body.billingEmail;
    if (body.legalEmail !== undefined) updatePayload.legal_email = body.legalEmail;

    const { data, error } = await adminClient
      .from("site_settings")
      .update(updatePayload)
      .eq("id", "singleton")
      .select("*")
      .single();

    if (error) throw new RouteError(500, error.message);

    await recordAuditLog(admin.userId, "update_site_settings", "site_settings", "singleton", body);

    return json({ ok: true, settings: data });
  } catch (error) {
    return errorResponse(error);
  }
}
