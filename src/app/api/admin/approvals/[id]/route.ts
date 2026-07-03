export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { requireAdminSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import ProfileApprovedEmail from "@/emails/ProfileApprovedEmail";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        id, full_name, display_name, email, phone, city, neighborhood_name,
        bio, specialties, incall_price, outcall_price, status, profile_status,
        created_at, submitted_at, approved_at, approved_by, rejected_at, rejected_by,
        rejection_reason, moderation_notes, is_verified_identity, is_verified_phone
      `)
      .eq("id", id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
    }

    const { data: photos } = await supabase
      .from("profile_photos")
      .select("url")
      .eq("profile_id", id)
      .order("sort_order", { ascending: true });

    const { data: documents } = await supabase
      .from("profile_documents")
      .select("url, type")
      .eq("profile_id", id);

    return NextResponse.json({
      ok: true,
      profile: {
        ...profile,
        photo_urls: photos?.map((p) => p.url) || [],
        document_urls: documents?.map((d) => d.url) || [],
      },
    });
  } catch (error) {
    console.error("[api/admin/approvals/[id]] Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminSession;
  try {
    adminSession = await requireAdminSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { action, notes } = (await request.json()) as {
      action: "approve" | "reject" | "changes_requested";
      notes: string;
    };
    const supabase = createSupabaseAdminClient();

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      changes_requested: "changes_requested",
    };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({
        status: statusMap[action],
        moderation_notes: notes || null,
        ...(action === "approve" ? { approved_at: now, approved_by: adminSession.userId } : {}),
        ...(action === "reject" ? { rejected_at: now, rejected_by: adminSession.userId, rejection_reason: notes || null } : {}),
      })
      .eq("id", id);

    if (error) throw error;

    if (action === "approve") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email_address, slug, display_name, user_id")
        .eq("id", id)
        .single();

      if (profile?.email_address) {
        const profileSlug = profile.slug ?? id;
        await sendEmail({
          to: profile.email_address,
          subject: "Your MasseurMatch Profile is Approved!",
          react: React.createElement(ProfileApprovedEmail, {
            profileUrl: `https://masseurmatch.com/therapists/${profileSlug}`,
            dashboardUrl: "https://masseurmatch.com/pro/dashboard",
          }),
        });
      }

      // Create in-app notification
      if (profile?.user_id) {
        await supabase.from("notifications").insert({
          user_id: profile.user_id,
          type: "profile_approved",
          title: "Profile Approved!",
          body: "Your therapist profile has been reviewed and approved. It's now visible to clients.",
          metadata: { profile_id: id, slug: profile.slug },
        });
      }
    } else if (action === "reject") {
      // Create rejection notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (profile?.user_id) {
        await supabase.from("notifications").insert({
          user_id: profile.user_id,
          type: "profile_rejected",
          title: "Profile Review Complete",
          body: `Your profile needs adjustments before it can be approved. Reason: ${notes || "Please review your profile and try again."}`,
          metadata: { profile_id: id, reason: notes },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/approvals/[id] POST] Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update profile status" }, { status: 500 });
  }
}
