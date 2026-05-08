import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { buildTherapistRevalidatePaths, triggerRevalidate } from "@/app/_lib/revalidate";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog, updateProfileByUserId } from "@/app/_lib/store";
import { massageTherapistProfileSchema } from "@/app/_lib/validation.massagist";

export async function GET(request: Request) {
  try {
    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);

    return json({
      ok: true,
      profile,
    });
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

    const body = await parseJsonBody(request, massageTherapistProfileSchema);
    
    // Map Zod schema fields to DB columns
    const nextProfile = await updateProfileByUserId(session.userId, {
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
      service_categories: sanitizeStringArray(body.massage_techniques), // Syncing for now
      height_inches: body.heightInches || null,
      weight_lb: body.weightLb || null,
      body_type: sanitizeOptionalText(body.bodyType),
      years_experience: body.years_experience || 0,
      languages: sanitizeStringArray(body.languages),
      offers_incall: body.offers_incall ?? true,
      offers_outcall: body.offers_outcall ?? true,
      outcall_radius: body.outcall_radius || null,
      starting_price: body.starting_rate || null,
      incall_price: body.starting_rate || null, // Legacy sync
      outcall_price: body.starting_rate || null, // Legacy sync
      seo_title: sanitizeOptionalText(body.seo_title),
      seo_description: sanitizeOptionalText(body.seo_description),
      seo_keywords: sanitizeStringArray(body.seo_keywords || []),
      slug: sanitizeText(body.slug),
      // Promotions are handled as JSONB in the profile for now
      promotions: body.gallery_photos ? profile.promotions : profile.promotions, // Placeholder for actual promo logic
      
      // Status logic
      profile_status: profile.profile_status === "approved" ? "under_review" : profile.profile_status,
      updated_at: new Date().toISOString(),
    });

    await recordAuditLog(session.userId, "provider.profile.update", "profile", profile.id, {
      fields: Object.keys(body),
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

    return json({
      ok: true,
      profile: nextProfile,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
