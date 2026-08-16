export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import { revalidatePublicDirectory } from "@/app/_lib/directory-cache";
import { buildProfileSlug } from "@/app/_lib/profile-slug";
import ProfileApprovedEmail from "@/emails/ProfileApprovedEmail";
import React from "react";

const schema = z.object({ reason: z.string().optional() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request);
    const { id: profileId } = await params;
    const body = await parseJsonBody(request, schema);
    const adminClient = createSupabaseAdminClient();

    const now = new Date().toISOString();
    const { data: profile, error: fetchError } = await adminClient
      .from("profiles")
      .select("id, user_id, profile_status, display_name, full_name, email_address, slug, city, phone, phone_number")
      .eq("id", profileId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const missingRequiredFields: string[] = [];
    if (!profile.city?.trim()) missingRequiredFields.push("city");
    if (!(profile.phone?.trim() || profile.phone_number?.trim())) missingRequiredFields.push("phone");

    if (missingRequiredFields.length > 0) {
      throw new RouteError(
        422,
        `Profile cannot be published until these required fields are completed: ${missingRequiredFields.join(", ")}.`,
      );
    }

    // Public profile pages are slug-addressed. Older/imported profiles can reach
    // admin review without a slug, so approval must repair that invariant.
    const publicSlug = profile.slug || buildProfileSlug(profile.display_name || profile.full_name, profile.id);

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        slug: publicSlug,
        status: "approved",
        profile_status: "approved",
        visibility_status: "public",
        is_active: true,
        approved_at: now,
        approved_by: admin.userId,
        rejection_reason: null,
        moderation_notes: body.reason || null,
        updated_at: now,
      })
      .eq("id", profileId);

    if (updateError) throw new RouteError(500, updateError.message);

    revalidatePublicDirectory();

    await adminClient
      .from("profile_reviews")
      .update({ status: "approved", reviewed_at: now, reviewed_by: admin.userId })
      .eq("profile_id", profileId);

    await adminClient.from("admin_actions").insert({
      action: "approve_profile",
      action_type: "approve_profile",
      target_table: "profiles",
      admin_id: admin.userId,
      target_user_id: profile.user_id,
      target_profile_id: profileId,
      reason: body.reason || null,
    });

    await recordAuditLog(admin.userId, "approve_profile", "profile", profileId, {
      reason: body.reason,
      slug: publicSlug,
    });

    if (profile.email_address) {
      await sendEmail({
        to: profile.email_address,
        subject: "Your MasseurMatch Profile is Approved!",
        react: React.createElement(ProfileApprovedEmail, {
          profileUrl: `https://masseurmatch.com/therapists/${publicSlug}`,
        }),
      });
    }

    return json({ ok: true, profileId, slug: publicSlug, status: "approved" });
  } catch (error) {
    return errorResponse(error);
  }
}
