import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { buildTherapistRevalidatePaths, triggerRevalidate } from "@/app/_lib/revalidate";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog, updateProfileByUserId } from "@/app/_lib/store";
import { proProfileSchema } from "@/app/_lib/validation";
import { massageTherapistProfileSchema } from "@/app/_lib/validation.massagist";

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

    const nextProfile = await updateProfileByUserId(session.userId, {
      ...parsed.updates,
      profile_status: profile.profile_status === "approved" ? "under_review" : profile.profile_status,
      updated_at: new Date().toISOString(),
    });

    await recordAuditLog(session.userId, "provider.profile.update", "profile", profile.id, {
      fields: parsed.fields,
    });

    await triggerRevalidate(
      await buildTherapistRevalidatePaths({
        id: nextProfile?.id || profile.id,
        slug: nextProfile?.slug || profile.slug,
        city: nextProfile?.city || profile.city,
      }),
      { request },
    ).catch((error) => {
      console.error("[api/pro/profile] Revalidation failed:", error);
    });

    return json({ ok: true, profile: nextProfile });
  } catch (error) {
    return errorResponse(error);
  }
}
