import React from "react";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { sendEmail } from "@/app/api/_lib/email";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog, updateProfileByUserId } from "@/app/_lib/store";
import { proProfileSchema } from "@/app/_lib/validation";
import { massageTherapistProfileSchema } from "@/app/_lib/validation.massagist";
import ProfileApprovedEmail from "@/emails/ProfileApprovedEmail";

function parseProfilePayload(raw: unknown) {
  const modern = massageTherapistProfileSchema.safeParse(raw);
  if (modern.success) {
    const body = modern.data;
    return {
      fields: Object.keys(body),
      updates: {
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
      },
    };
  }

  const legacy = proProfileSchema.safeParse(raw);
  if (legacy.success) {
    const body = legacy.data;
    return {
      fields: Object.keys(body),
      updates: {
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
      },
    };
  }

  throw new RouteError(400, "Invalid profile payload.");
}

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    return json({ ok: true, profile });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile", { limit: 20, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    if (!profile) {
      throw new RouteError(404, "Profile not found.");
    }

    const rawBody = await request.json().catch(() => {
      throw new RouteError(400, "Invalid JSON request body.");
    });
    const parsed = parseProfilePayload(rawBody);

    const rulesAccepted = rawBody && typeof rawBody === "object" && (rawBody as Record<string, unknown>).rulesAccepted === true;
    const moderationPassed = rawBody && typeof rawBody === "object" && (rawBody as Record<string, unknown>).moderationPassed === true;

    const wasApproved = profile.profile_status === "approved" || profile.profile_status === "under_review";
    const canAutoApprove = wasApproved && rulesAccepted && moderationPassed;

    const now = new Date().toISOString();
    const nextStatus = canAutoApprove ? "approved" : (
      profile.profile_status === "approved" ? "under_review" : profile.profile_status
    );

    const statusUpdates: Record<string, unknown> = {
      profile_status: nextStatus,
      updated_at: now,
    };
    if (canAutoApprove) {
      statusUpdates.approved_at = now;
      statusUpdates.visibility_status = "public";
    }
    if (rulesAccepted) {
      statusUpdates.terms_accepted_at = now;
    }

    const nextProfile = await updateProfileByUserId(session.userId, {
      ...parsed.updates,
      ...statusUpdates,
    });

    await recordAuditLog(session.userId, "provider.profile.update", "profile", profile.id, {
      fields: parsed.fields,
      autoApproved: canAutoApprove,
    });

    if (canAutoApprove) {
      const emailAddress = (nextProfile as Record<string, unknown>)?.email_address as string | null
        || profile.email_address as string | null;
      const slug = nextProfile?.slug || profile.slug;
      if (emailAddress) {
        sendEmail({
          to: emailAddress,
          subject: "Your MasseurMatch Profile is Approved!",
          react: React.createElement(ProfileApprovedEmail, {
            profileUrl: `https://masseurmatch.com/therapists/${slug || profile.id}`,
          }),
        }).catch((err) => {
          console.error("[api/pro/profile] Approval email failed:", err);
        });
      }
    }

    await import("@/app/_lib/revalidate").then(({ buildTherapistRevalidatePaths, triggerRevalidate }) =>
      buildTherapistRevalidatePaths({
        id: nextProfile?.id || profile.id,
        slug: nextProfile?.slug || profile.slug,
        city: nextProfile?.city || profile.city,
      }).then((paths) => triggerRevalidate(paths, { request }))
    ).catch((error) => {
      console.error("[api/pro/profile] Revalidation failed:", error);
    });

    return json({ ok: true, profile: nextProfile, autoApproved: canAutoApprove });
  } catch (error) {
    return errorResponse(error);
  }
}
