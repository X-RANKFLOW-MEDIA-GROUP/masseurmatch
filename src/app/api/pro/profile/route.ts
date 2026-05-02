import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { buildTherapistRevalidatePaths, triggerRevalidate } from "@/app/_lib/revalidate";
import { assertRateLimit, sanitizeOptionalText, sanitizeStringArray, sanitizeText } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getProfileByUserId, recordAuditLog, updateProfileByUserId } from "@/app/_lib/store";
import { massageTherapistProfileSchema } from "@/app/_lib/validation.massagist";
import { z } from "zod";

const legacyProfileSchema = z.object({ displayName:z.string(), bio:z.string(), city:z.string(), state:z.string().nullable().optional(), phone:z.string().nullable().optional(), specialties:z.array(z.string()).default([]), incallPrice:z.number().nullable().optional(), outcallPrice:z.number().nullable().optional(), heightInches:z.number().nullable().optional(), weightLb:z.number().nullable().optional(), bodyType:z.string().nullable().optional() });

export async function GET(request: Request) {
  try { const session = requireRequestSession(request); const profile = await getProfileByUserId(session.userId); return json({ ok:true, profile }); } catch (error) { return errorResponse(error);} }

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile", { limit: 20, windowMs: 60_000 });
    const session = requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");
    const raw = await request.json();
    const modern = massageTherapistProfileSchema.safeParse(raw);
    const legacy = legacyProfileSchema.safeParse(raw);
    if (!modern.success && !legacy.success) throw new RouteError(422, "Invalid profile payload.");

    const updates = modern.success ? {
      display_name: sanitizeText(modern.data.display_name),
      full_name: sanitizeText(modern.data.full_name),
      headline: sanitizeOptionalText(modern.data.headline),
      bio: sanitizeText(modern.data.bio_full),
      city: sanitizeText(modern.data.city),
      state: sanitizeOptionalText(modern.data.state),
      neighborhood: sanitizeOptionalText(modern.data.neighborhood),
      phone: sanitizeOptionalText(modern.data.phone_number),
      whatsapp_number: sanitizeOptionalText(modern.data.whatsapp_number),
      email_address: sanitizeOptionalText(modern.data.email_address),
      website: sanitizeOptionalText(modern.data.booking_link),
      specialties: sanitizeStringArray(modern.data.specialties),
      massage_techniques: sanitizeStringArray(modern.data.massage_techniques),
      service_categories: sanitizeStringArray(modern.data.massage_techniques),
      height_inches: modern.data.heightInches || null,
      weight_lb: modern.data.weightLb || null,
      body_type: sanitizeOptionalText(modern.data.bodyType),
      years_experience: modern.data.years_experience || 0,
      languages: sanitizeStringArray(modern.data.languages),
      offers_incall: modern.data.offers_incall ?? true,
      offers_outcall: modern.data.offers_outcall ?? true,
      outcall_radius: modern.data.outcall_radius || null,
      starting_price: modern.data.starting_rate || null,
      incall_price: modern.data.starting_rate || null,
      outcall_price: modern.data.starting_rate || null,
      seo_title: sanitizeOptionalText(modern.data.seo_title),
      seo_description: sanitizeOptionalText(modern.data.seo_description),
      seo_keywords: sanitizeStringArray(modern.data.seo_keywords || []),
      slug: sanitizeText(modern.data.slug),
      promotions: profile.promotions,
      profile_status: profile.profile_status === "approved" ? "under_review" : profile.profile_status,
      updated_at: new Date().toISOString(),
    } : (() => { const legacyData = legacy.data!; return {
      display_name: sanitizeText(legacyData.displayName),
      full_name: sanitizeText(legacyData.displayName),
      bio: sanitizeText(legacyData.bio),
      city: sanitizeText(legacyData.city),
      state: sanitizeOptionalText(legacyData.state),
      phone: sanitizeOptionalText(legacyData.phone),
      specialties: sanitizeStringArray(legacyData.specialties),
      incall_price: legacyData.incallPrice ?? null,
      outcall_price: legacyData.outcallPrice ?? null,
      height_inches: legacyData.heightInches ?? null,
      weight_lb: legacyData.weightLb ?? null,
      body_type: sanitizeOptionalText(legacyData.bodyType),
      profile_status: profile.profile_status === "approved" ? "under_review" : profile.profile_status,
      updated_at: new Date().toISOString(),
    }; })();

    const nextProfile = await updateProfileByUserId(session.userId, updates);
    await recordAuditLog(session.userId, "provider.profile.update", "profile", profile.id, { fields: Object.keys(raw || {}) });
    await triggerRevalidate(await buildTherapistRevalidatePaths({ id: nextProfile?.id || profile.id, slug: nextProfile?.slug || profile.slug, city: nextProfile?.city || profile.city }), { request }).catch(()=>{});
    return json({ ok: true, profile: nextProfile });
  } catch (error) { return errorResponse(error); }
}
