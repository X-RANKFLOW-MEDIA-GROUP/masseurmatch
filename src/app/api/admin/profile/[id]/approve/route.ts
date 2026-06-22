export const dynamic = "force-dynamic";
import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, recordAuditLog, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
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
      .select("id, user_id, profile_status, display_name, full_name, email_address, slug")
      .eq("id", profileId)
      .maybeSingle();

    if (fetchError) throw new RouteError(500, fetchError.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        profile_status: "approved",
        visibility_status: "public",
        verification_status: "verified",
        approved_at: now,
        approved_by: admin.userId,
        moderation_notes: body.reason || null,
        updated_at: now,
      })
      .eq("id", profileId);

    if (updateError) throw new RouteError(500, updateError.message);

    // Update profile_reviews
    await adminClient
      .from("profile_reviews")
      .update({ status: "approved", reviewed_at: now, reviewed_by: admin.userId })
      .eq("profile_id", profileId);

    // Log admin action
    await adminClient.from("admin_actions").insert({
      action: "approve_profile",
      target_table: "profiles",
      admin_id: admin.userId,
      action: "approve_profile",
      action_type: "approve_profile",
      target_table: "profiles",
      target_user_id: profile.user_id,
      target_profile_id: profileId,
      reason: body.reason || null,
    });

    await recordAuditLog(admin.userId, "approve_profile", "profile", profileId, {
      reason: body.reason,
    });

    // Send Approval Email
    if (profile.email_address) {
      await sendEmail({
        to: profile.email_address,
        subject: "Your MasseurMatch Profile is Approved!",
        react: React.createElement(ProfileApprovedEmail, {
          profileUrl: `https://masseurmatch.com/therapists/${profile.slug || profile.id}`,
        }),
      });
    }

    return json({ ok: true, profileId, status: "approved" });
  } catch (error) {
    return errorResponse(error);
  }
}
