import React from "react";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { sendEmail } from "@/app/api/_lib/email";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/api/_lib/session";
import { getProfileByUserId, recordAuditLog, updateProfileByUserId } from "@/app/_lib/store";
import { proProfileSchema } from "@/app/_lib/validation";
import { massageTherapistProfileSchema } from "@/app/_lib/validation.massagist";
import ProfileApprovedEmail from "@/emails/ProfileApprovedEmail";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { slugify } from "@/components/profile/profile-utils";
import { buildProfileSlug } from "@/app/_lib/profile-slug";

const PROTECTED_TEXT_FIELDS = [
  "display_name",
  "full_name",
  "bio",
  "city",
  "state",
  "phone",
  "email_address",
] as const;

const PROTECTED_ARRAY_FIELDS = [
  "specialties",
  "massage_techniques",
  "service_categories",
  "languages",
] as const;

function stripDestructiveEmptyFields(updates: Record<string, unknown>) {
  for (const field of PROTECTED_TEXT_FIELDS) {
    const value = updates[field];
    if (value === null || (typeof value === "string" && !value.trim())) {
      delete updates[field];
    }
  }
  for (const field of PROTECTED_ARRAY_FIELDS) {
    const value = updates[field];
    if (Array.isArray(value) && value.length === 0) {
      delete updates[field];
    }
  }
  return updates;
}

function parseProfilePayload(raw: unknown) {
  const modern = massageTherapistProfileSchema.safeParse(raw);
  if (modern.success) {
    const body = modern.data;
    return {
      fields: Object.keys(body),
      updates: stripDestructiveEmptyFields({
        display_name: sanitizeText(body.display_name),
        full_name: sanitizeText(body.full_name),
        headline: sanitizeOptionalText(body.headline),
        bio: sanitizeText(body.bio_full),
        city: sanitizeText(body.city),
        state: sanitizeOptionalText(body.state),
        neighborhood: sanitizeOptionalText(body.neighborhood),
        phone: sanitizeOptionalText(body.phone_number),
        whatsapp_number: sanitizeOptionalText(body.whatsapp_number),
        email_address: sanitizeOptionalText(body.email_address),
        website: sanitizeOptionalText(body.booking_link),
        specialties: sanitizeStringArray(body.specialties),
        massage_techniques: sanitizeStringArray(body.massage_techniques),
        service_categories: sanitizeStringArray(body.massage_techniques),
        height_inches: body.heightInches || null,
        weight_lb: body.weightLb || null,
        body_type: sanitizeOptionalText(body.bodyType),
        years_experience: body.years_experience || 0,
        languages: sanitizeStringArray(body.languages),
        offers_incall: body.offers_incall ?? true,
        offers_outcall: body.offers_outcall ?? true,
        outcall_radius: body.outcall_radius || null,
        starting_price: body.starting_rate || null,
        incall_price: body.starting_rate || null,
        outcall_price: body.starting_rate || null,
        seo_title: sanitizeOptionalText(body.seo_title),
        seo_description: sanitizeOptionalText(body.seo_description),
        seo_keywords: sanitizeStringArray(body.seo_keywords || []),
        slug: sanitizeText(body.slug),
      }),
    };
  }

  const legacy = proProfileSchema.safeParse(raw);
  if (legacy.success) {
    const body = legacy.data;
    return {
      fields: Object.keys(body),
      updates: stripDestructiveEmptyFields({
        display_name: sanitizeText(body.displayName),
        full_name: sanitizeText(body.displayName),
        bio: sanitizeText(body.bio),
        city: sanitizeText(body.city),
        state: sanitizeOptionalText(body.state),
        neighborhood: sanitizeOptionalText(body.neighborhood),
        phone: sanitizeOptionalText(body.phone),
        whatsapp_number: sanitizeOptionalText(body.whatsapp),
        email_address: sanitizeOptionalText(body.email),
        website: sanitizeOptionalText(body.website),
        specialties: sanitizeStringArray(body.specialties),
        service_categories: sanitizeStringArray(body.specialties),
        incall_price: body.incallPrice ?? null,
        outcall_price: body.outcallPrice ?? null,
        starting_price: body.incallPrice ?? body.outcallPrice ?? null,
        offers_incall: body.locationType !== "outcall",
        offers_outcall: body.locationType !== "incall",
        height_inches: body.heightInches ?? null,
        weight_lb: body.weightLb ?? null,
        body_type: sanitizeOptionalText(body.bodyType),
        ...(body.travelSchedule !== undefined && {
          travel_schedule: body.travelSchedule.map((t) => ({
            city: sanitizeText(t.city),
            state: sanitizeOptionalText(t.state) ?? null,
            start_date: t.start_date,
            end_date: t.end_date,
          })),
        }),
      }),
    };
  }

  throw new RouteError(400, "Invalid profile payload.");
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const isDashboard = new URL(request.url).searchParams.get("dashboard") === "true";

    const select = isDashboard
      ? "id, display_name, full_name, bio, city, state, status, profile_status, visibility_status, is_active, current_status, available_now, available_now_expires, specialties, incall_price, outcall_price, subscription_tier, is_featured, completion_percentage"
      : "*";

    const { data: profile, error } = await admin
      .from("profiles")
      .select(select)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    return json({ ok: true, profile });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile", { limit: 20, windowMs: 60_000 });
    const session = await requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) throw new RouteError(404, "Profile not found.");

    const rawBody = await request.json().catch(() => {
      throw new RouteError(400, "Invalid JSON request body.");
    });
    const parsed = parseProfilePayload(rawBody);
    const rulesAccepted = rawBody && typeof rawBody === "object" && (rawBody as Record<string, unknown>).rulesAccepted === true;
    const canAutoApprove = false;
    const now = new Date().toISOString();
    const nextStatus = profile.profile_status;
    const statusUpdates: Record<string, unknown> = {
      profile_status: nextStatus,
      updated_at: now,
    };

    if (canAutoApprove) {
      statusUpdates.approved_at = now;
      statusUpdates.visibility_status = "public";
    }
    if (rulesAccepted) statusUpdates.terms_accepted_at = now;

    const updates = { ...parsed.updates } as Record<string, unknown>;
    const clientSlug = typeof updates.slug === "string" ? slugify(updates.slug) : "";
    if (clientSlug) {
      updates.slug = clientSlug;
    } else {
      delete updates.slug;
      if (!profile.slug) {
        const displayName =
          (typeof updates.display_name === "string" && updates.display_name) ||
          profile.display_name ||
          profile.full_name;
        updates.slug = buildProfileSlug(displayName, profile.id);
      }
    }

    const safeUpdates = updates as TablesUpdate<"profiles">;
    const updatedProfile = await updateProfileByUserId(session.userId, {
      ...safeUpdates,
      ...statusUpdates,
    });

    await recordAuditLog(session.userId, "profile_updated", "profile", profile.id, {
      fields: parsed.fields,
      status: nextStatus,
    });

    if (canAutoApprove && profile.email_address) {
      await sendEmail({
        to: profile.email_address,
        subject: "Your MasseurMatch Profile is Approved!",
        react: React.createElement(ProfileApprovedEmail, {
          profileUrl: `https://masseurmatch.com/therapists/${updatedProfile.slug || profile.id}`,
          dashboardUrl: "https://masseurmatch.com/pro/dashboard",
        }),
      });
    }

    return json({ ok: true, profile: updatedProfile });
  } catch (error) {
    return errorResponse(error);
  }
}
