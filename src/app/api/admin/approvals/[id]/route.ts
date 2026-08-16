export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { requireAdminSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import { revalidatePublicDirectory } from "@/app/_lib/directory-cache";
import { SUPABASE_PUBLIC_URL } from "@/integrations/supabase/client";
import ProfileApprovedEmail from "@/emails/ProfileApprovedEmail";

type RequestedTier = "free" | "standard" | "pro" | "elite";

function normalizeRequestedTier(value: string | null | undefined): RequestedTier {
  if (value === "standard" || value === "pro" || value === "elite") return value;
  return "free";
}

function planLabel(tier: RequestedTier) {
  if (tier === "standard") return "Standard";
  if (tier === "pro") return "Pro";
  if (tier === "elite") return "Elite";
  return "Free";
}

function resolvePhotoUrl(url: string | null, storagePath: string | null) {
  if (url) return url;
  if (!storagePath) return null;
  if (/^https?:\/\//i.test(storagePath)) return storagePath;
  return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/therapist-photos/${storagePath}`;
}

function normalizePhone(value: string | null | undefined) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

function normalizeCompletion(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

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
        id, full_name, display_name, email, phone, phone_number, city, neighborhood_name,
        bio, specialties, incall_price, outcall_price, status, profile_status,
        created_at, submitted_at, approved_at, approved_by, rejected_at, rejected_by,
        rejection_reason, moderation_notes, is_verified_identity, is_verified_phone,
        completion_percentage
      `)
      .eq("id", id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
    }

    const { data: photos } = await supabase
      .from("profile_photos")
      .select("url, storage_path")
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
        profile_completion: normalizeCompletion(profile.completion_percentage),
        photo_urls: (photos ?? [])
          .map((photo) => resolvePhotoUrl(photo.url, photo.storage_path))
          .filter((url): url is string => Boolean(url)),
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

    let requestedTier: RequestedTier = "free";
    let paymentRequired = false;
    let activePaidEntitlement = false;

    if (action === "approve") {
      const { data: publishCandidate, error: candidateError } = await supabase
        .from("profiles")
        .select("user_id, city, phone, phone_number, is_verified_phone, _tier")
        .eq("id", id)
        .maybeSingle();

      if (candidateError) throw candidateError;
      if (!publishCandidate) {
        return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
      }
      if (!publishCandidate.user_id) {
        return NextResponse.json(
          { ok: false, error: "Profile is not linked to a provider account." },
          { status: 422 },
        );
      }

      const missingRequiredFields: string[] = [];
      const profilePhone = publishCandidate.phone?.trim() || publishCandidate.phone_number?.trim() || null;
      if (!publishCandidate.city?.trim()) missingRequiredFields.push("city");
      if (!profilePhone) missingRequiredFields.push("phone");
      if (publishCandidate.is_verified_phone !== true) missingRequiredFields.push("verified phone");

      if (missingRequiredFields.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: `Profile cannot be published until these required fields are completed: ${missingRequiredFields.join(", ")}.`,
            missingRequiredFields,
          },
          { status: 422 },
        );
      }

      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(publishCandidate.user_id);
      const authPhone = normalizePhone(authUser.user?.phone);
      if (
        authError ||
        !authUser.user?.phone_confirmed_at ||
        !authPhone ||
        authPhone !== normalizePhone(profilePhone)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "Profile phone must match the phone number confirmed by Supabase before publication.",
            missingRequiredFields: ["verified phone"],
          },
          { status: 422 },
        );
      }

      requestedTier = normalizeRequestedTier(publishCandidate._tier);
      paymentRequired = requestedTier !== "free";

      if (paymentRequired) {
        const { data: subscriptions, error: subscriptionError } = await supabase
          .from("therapist_subscriptions")
          .select("id")
          .eq("profile_id", id)
          .eq("provider", "paypal")
          .in("status", ["trialing", "active"])
          .limit(1);
        if (subscriptionError) throw subscriptionError;
        activePaidEntitlement = Boolean(subscriptions?.length);
      }
    }

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      changes_requested: "changes_requested",
    };

    const now = new Date().toISOString();
    const publishNow = action === "approve" && (!paymentRequired || activePaidEntitlement);

    const visibility =
      action === "approve"
        ? {
            profile_status: "approved",
            visibility_status: publishNow ? "public" : "hidden",
            is_active: publishNow,
            approved_at: now,
            approved_by: adminSession.userId,
          }
        : action === "reject"
          ? { profile_status: "rejected", visibility_status: "hidden", is_active: false, rejected_at: now, rejected_by: adminSession.userId, rejection_reason: notes || null }
          : { profile_status: "changes_requested", visibility_status: "hidden", is_active: false };

    const { error } = await supabase
      .from("profiles")
      .update({
        status: statusMap[action],
        moderation_notes: notes || null,
        ...visibility,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePublicDirectory();

    if (action === "approve") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email_address, slug, display_name, user_id")
        .eq("id", id)
        .single();

      const checkoutRequired = paymentRequired && !activePaidEntitlement;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://masseurmatch.com";
      const billingUrl = `${appUrl}/pro/billing?checkout=${requestedTier}`;

      if (profile?.email_address) {
        const profileSlug = profile.slug ?? id;
        await sendEmail({
          to: profile.email_address,
          subject: checkoutRequired
            ? `Your MasseurMatch profile is approved — activate ${planLabel(requestedTier)}`
            : "Your MasseurMatch Profile is Approved!",
          react: React.createElement(ProfileApprovedEmail, {
            profileUrl: `https://masseurmatch.com/therapists/${profileSlug}`,
            dashboardUrl: `${appUrl}/pro/dashboard`,
            billingUrl,
            requiresPayment: checkoutRequired,
            planName: planLabel(requestedTier),
          }),
        });
      }

      if (profile?.user_id) {
        await supabase.from("notifications").insert({
          user_id: profile.user_id,
          type: "profile_approved",
          title: checkoutRequired ? "Profile Approved — Activate Your Plan" : "Profile Approved!",
          message: checkoutRequired
            ? `Your profile passed review. Activate your ${planLabel(requestedTier)} subscription through PayPal to publish your listing.`
            : "Your therapist profile has been reviewed and approved. It's now visible to clients.",
          data: checkoutRequired
            ? { profile_id: id, slug: profile.slug, billing_url: billingUrl, requested_tier: requestedTier }
            : { profile_id: id, slug: profile.slug },
        });
      }
    } else if (action === "reject") {
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
          message: `Your profile needs adjustments before it can be approved. Reason: ${notes || "Please review your profile and try again."}`,
          data: { profile_id: id, reason: notes },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/approvals/[id] POST] Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update profile status" }, { status: 500 });
  }
}
