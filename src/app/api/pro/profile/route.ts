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
import { resolveAvailableNowTransition } from "@/app/_lib/available-now";
import { PROVIDER_STATUS_VALUES } from "@/lib/provider-status";

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

function normalizePhone(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

function profileStoredPhone(profile: unknown) {
  const record = profile as Record<string, unknown>;
  return normalizePhone(record.phone) || normalizePhone(record.phone_number);
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
      ? "id, display_name, full_name, bio, city, state, phone, phone_number, status, is_active, visibility_status, available_now, available_now_expires, specialties, incall_price, outcall_price, subscription_tier, is_featured"
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

    const requestedPhone = normalizePhone(parsed.updates.phone);
    const effectivePhone = requestedPhone || profileStoredPhone(profile);
    if (!effectivePhone) {
      throw new RouteError(422, "A valid phone number is required on every provider profile.", "PHONE_REQUIRED");
    }
    parsed.updates.phone = effectivePhone;
    parsed.updates.phone_number = effectivePhone;

    const rulesAccepted = rawBody && typeof rawBody === "object" && (rawBody as Record<string, unknown>).rulesAccepted === true;
    const canAutoApprove = false;
    const now = new Date().toISOString();
    const statusUpdates: Record<string, unknown> = {
      profile_status: profile.profile_status,
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
        const city = (typeof updates.city === "string" && updates.city) || profile.city;
        const specialty = Array.isArray(updates.specialties)
          ? updates.specialties[0]
          : profile.specialties?.[0];
        updates.slug = buildProfileSlug(displayName, profile.id, city, specialty);
      }
    }

    const nextProfile = await updateProfileByUserId(session.userId, {
      ...updates,
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

const hoursEntrySchema = z.object({
  days: z.string().max(40),
  start: z.string().max(20),
  end: z.string().max(20),
});

const mobileHoursSchema = z.union([
  z.object({ sameAsStudio: z.literal(true) }),
  z.array(hoursEntrySchema),
]);

const pricingSessionSchema = z.object({
  minutes: z.number().int().min(1).max(600),
  incall_rate: z.number().int().min(0).nullable(),
  outcall_rate: z.number().int().min(0).nullable(),
});

function validatePricingMarkup(sessions: z.infer<typeof pricingSessionSchema>[]) {
  if (sessions.length < 2) return true;
  const base = sessions.find((s) => s.minutes === 60);
  if (!base) return true;

  for (const s of sessions) {
    if (s.minutes === 60) continue;
    const ratio = s.minutes / 60;
    if (s.incall_rate != null && base.incall_rate != null && base.incall_rate > 0) {
      const maxRate = Math.ceil(base.incall_rate * ratio * 1.3334);
      if (s.incall_rate > maxRate) return false;
    }
    if (s.outcall_rate != null && base.outcall_rate != null && base.outcall_rate > 0) {
      const maxRate = Math.ceil(base.outcall_rate * ratio * 1.3334);
      if (s.outcall_rate > maxRate) return false;
    }
  }
  return true;
}

const educationEntrySchema = z.object({
  degree: z.string().max(120).default(""),
  institution: z.string().max(160).default(""),
  location: z.string().max(160).default(""),
  start_month: z.number().int().min(0).max(12).nullable().default(null),
  start_year: z.number().int().min(1900).max(2100).nullable().default(null),
  end_month: z.number().int().min(0).max(12).nullable().default(null),
  end_year: z.number().int().min(1900).max(2100).nullable().default(null),
});

const dayDiscountSchema = z
  .object({
    percent: z.number().int().min(0).max(100),
    day: z.string().max(20),
  })
  .nullable();

const strArr = z.array(z.string().max(200)).max(120);

const fullProfileSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  headline: z.string().max(160).optional().nullable(),
  bio: z.string().max(4000).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
  neighborhood: z.string().max(160).optional().nullable(),
  zipCode: z.string().max(12).optional().nullable(),
  streetReference: z.string().max(255).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  whatsapp: z.string().max(40).optional().nullable(),
  email: z.string().max(160).optional().nullable(),
  showEmail: z.boolean().optional(),
  website: z.string().max(255).optional().nullable(),
  bookingUrl: z.string().max(255).optional().nullable(),
  bookingPlatform: z.string().max(80).optional().nullable(),
  offersIncall: z.boolean().optional(),
  offersOutcall: z.boolean().optional(),
  outcallRadius: z.number().int().min(0).max(1000).optional().nullable(),
  mapEnabled: z.boolean().optional(),
  massageTechniques: strArr.optional(),
  serviceCategories: strArr.optional(),
  specialties: strArr.optional(),
  massageSetup: strArr.optional(),
  mobileExtras: strArr.optional(),
  additionalServices: strArr.optional(),
  studioAmenities: strArr.optional(),
  productsUsed: strArr.optional(),
  productsSold: strArr.optional(),
  paymentMethods: strArr.optional(),
  languages: strArr.optional(),
  affiliations: strArr.optional(),
  rateDisclaimers: strArr.optional(),
  regularDiscounts: strArr.optional(),
  pricingSessions: z.array(pricingSessionSchema).max(40).optional(),
  dayOfWeekDiscount: dayDiscountSchema.optional(),
  educationEntries: z.array(educationEntrySchema).max(40).optional(),
  studioHours: z.array(hoursEntrySchema).max(20).optional(),
  mobileHours: mobileHoursSchema.optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Expected YYYY-MM or YYYY-MM-DD")
    .optional()
    .nullable(),
  yearsExperience: z.number().int().min(0).max(80).optional().nullable(),
  heightInches: z.number().int().min(36).max(96).optional().nullable(),
  weightLb: z.number().int().min(60).max(600).optional().nullable(),
  bodyType: z.string().max(50).optional().nullable(),
  availableNow: z.boolean().optional(),
  currentStatus: z.enum(PROVIDER_STATUS_VALUES).optional().nullable(),
  lgbtqAffirming: z.boolean().optional(),
});

function normalizeStartDate(value: string | null | undefined) {
  if (!value) return null;
  const date = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  return `${date}T00:00:00.000Z`;
}

export async function PATCH(request: Request) {
  try {
    assertRateLimit(request, "pro-profile", { limit: 30, windowMs: 60_000 });

    const session = await requireRequestSession(request);
    const profile = await getProfileByUserId(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const body = await parseJsonBody(request, fullProfileSchema);
    const updates: Record<string, unknown> = {};
    const text = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

    const effectivePhone = normalizePhone(body.phone) || profileStoredPhone(profile);
    if (!effectivePhone) {
      throw new RouteError(422, "A valid phone number is required on every provider profile.", "PHONE_REQUIRED");
    }

    if (body.displayName !== undefined) {
      updates.display_name = body.displayName.trim();
      updates.full_name = body.displayName.trim();
    }
    if (body.headline !== undefined) updates.headline = text(body.headline);
    if (body.bio !== undefined) updates.bio = text(body.bio);
    if (body.tagline !== undefined) updates.tagline = text(body.tagline);
    if (text(body.city)) updates.city = text(body.city);
    if (text(body.state)) updates.state = text(body.state);
    if (body.neighborhood !== undefined) updates.neighborhood = text(body.neighborhood);
    if (body.zipCode !== undefined) updates.zip_code = text(body.zipCode);
    if (body.streetReference !== undefined) updates.street_reference = text(body.streetReference);

    updates.phone = effectivePhone;
    updates.phone_number = effectivePhone;
    if (body.whatsapp !== undefined) updates.whatsapp_number = text(body.whatsapp);
    if (body.email !== undefined) updates.email_address = text(body.email);
    if (body.showEmail !== undefined) updates.show_email = body.showEmail;
    if (body.website !== undefined) updates.website = text(body.website);
    if (body.bookingUrl !== undefined) updates.booking_url = text(body.bookingUrl);
    if (body.bookingPlatform !== undefined) updates.booking_platform = text(body.bookingPlatform);
    if (body.offersIncall !== undefined) updates.offers_incall = body.offersIncall;
    if (body.offersOutcall !== undefined) updates.offers_outcall = body.offersOutcall;
    if (body.outcallRadius !== undefined) updates.outcall_radius = body.outcallRadius;
    if (body.mapEnabled !== undefined) updates.map_enabled = body.mapEnabled;
    if (body.massageTechniques !== undefined) updates.massage_techniques = body.massageTechniques;
    if (body.serviceCategories !== undefined) updates.service_categories = body.serviceCategories;
    if (body.specialties !== undefined) updates.specialties = body.specialties;
    if (body.massageSetup !== undefined) updates.massage_setup = body.massageSetup;
    if (body.mobileExtras !== undefined) updates.mobile_extras = body.mobileExtras;
    if (body.additionalServices !== undefined) updates.additional_services = body.additionalServices;
    if (body.studioAmenities !== undefined) updates.studio_amenities = body.studioAmenities;
    if (body.productsUsed !== undefined) updates.products_used = body.productsUsed;
    if (body.productsSold !== undefined) updates.products_sold = body.productsSold;
    if (body.paymentMethods !== undefined) updates.payment_methods = body.paymentMethods;
    if (body.languages !== undefined) updates.languages = body.languages;
    if (body.affiliations !== undefined) updates.affiliations = body.affiliations;
    if (body.rateDisclaimers !== undefined) updates.rate_disclaimers = body.rateDisclaimers;
    if (body.regularDiscounts !== undefined) updates.regular_discounts = body.regularDiscounts;

    if (body.pricingSessions !== undefined) {
      if (!validatePricingMarkup(body.pricingSessions)) {
        throw new RouteError(400, "Rates cannot exceed 33.33% above the 60-minute base rate.");
      }
      updates.pricing_sessions = body.pricingSessions;
    }
    if (body.dayOfWeekDiscount !== undefined) updates.day_of_week_discount = body.dayOfWeekDiscount;
    if (body.educationEntries !== undefined) updates.education_entries = body.educationEntries;
    if (body.studioHours !== undefined) updates.studio_hours = body.studioHours;
    if (body.mobileHours !== undefined) updates.mobile_hours = body.mobileHours;
    if (body.startDate !== undefined) updates.start_date = normalizeStartDate(body.startDate);
    if (body.yearsExperience !== undefined) updates.years_experience = body.yearsExperience;
    if (body.heightInches !== undefined) updates.height_inches = body.heightInches;
    if (body.weightLb !== undefined) updates.weight_lb = body.weightLb;
    if (body.bodyType !== undefined) updates.body_type = text(body.bodyType);
    if (body.availableNow !== undefined) {
      const transition = resolveAvailableNowTransition(profile, body.availableNow);
      Object.assign(updates, transition.updates);
    }
    if (body.currentStatus !== undefined) updates.current_status = body.currentStatus;
    if (body.lgbtqAffirming !== undefined) updates.lgbtq_affirming = body.lgbtqAffirming;

    // Self-service edits are audited but do not demote an already approved
    // profile. This keeps rate and profile edits live without an admin round trip.
    updates.profile_status = profile.profile_status;
    updates.updated_at = new Date().toISOString();

    const adminClient = createSupabaseAdminClient();
    const { data: nextProfile, error } = await adminClient
      .from("profiles")
      .update(updates as TablesUpdate<"profiles">)
      .eq("user_id", session.userId)
      .select("*")
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);

    await recordAuditLog(session.userId, "provider.profile.update", "profile", profile.id, {
      fields: Object.keys(updates),
      keptCurrentApproval: profile.profile_status === "approved",
    });

    await import("@/app/_lib/revalidate")
      .then(({ buildTherapistRevalidatePaths, triggerRevalidate }) =>
        buildTherapistRevalidatePaths({
          id: nextProfile?.id || profile.id,
          slug: nextProfile?.slug || profile.slug,
          city: nextProfile?.city || profile.city,
        }).then((paths) => triggerRevalidate(paths, { request })),
      )
      .catch((revalError) => {
        console.error("[api/pro/profile] Revalidation failed:", revalError);
      });

    return json({ ok: true, profile: nextProfile });
  } catch (error) {
    return errorResponse(error);
  }
}
