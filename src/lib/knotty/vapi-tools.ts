import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { RouteError } from "@/app/api/_lib/http";
import { createSupabaseWebhookAdminClient, recordAuditLog } from "@/app/api/_lib/supabase-server";
import type { Database, Json } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

type VapiToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

type VapiEnvelope = {
  message?: {
    customer?: { number?: string | null };
    call?: { customer?: { number?: string | null } };
    toolCallList?: unknown;
    toolCalls?: unknown;
  };
  customer?: { number?: string | null };
  call?: { customer?: { number?: string | null } };
  toolCallList?: unknown;
  toolCalls?: unknown;
};

const writeConfirmationSchema = z.object({
  confirmed: z.literal(true, {
    errorMap: () => ({ message: "Provider confirmation is required before saving this change." }),
  }),
});

const safeString = z.string().trim().min(1).max(4000);
const shortString = z.string().trim().min(1).max(200);
const stringList = z.array(z.string().trim().min(1).max(120)).max(80);

const profileSelect = [
  "id",
  "user_id",
  "display_name",
  "full_name",
  "headline",
  "tagline",
  "bio",
  "city",
  "state",
  "neighborhood",
  "phone",
  "phone_number",
  "whatsapp_number",
  "email_address",
  "massage_techniques",
  "specialties",
  "languages",
  "offers_incall",
  "offers_outcall",
  "starting_price",
  "incall_price",
  "outcall_price",
  "pricing_sessions",
  "studio_hours",
  "mobile_hours",
  "availability_note",
  "travel_schedule",
  "profile_status",
  "visibility_status",
  "verification_status",
  "subscription_tier",
  "subscription_status",
  "subscription_current_period_end",
  "subscription_cancel_at_period_end",
  "profile_completion_score",
  "profile_completeness",
  "completion_percentage",
  "updated_at",
].join(",");

function secureEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function assertVapiAuthorization(request: Request): void {
  const expected = process.env.VAPI_WEBHOOK_SECRET?.trim();
  if (!expected) {
    throw new RouteError(500, "VAPI_WEBHOOK_SECRET is not configured.");
  }

  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const token = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : request.headers.get("x-vapi-secret")?.trim() ?? "";

  if (!token || !secureEqual(token, expected)) {
    throw new RouteError(401, "Invalid Vapi webhook credentials.");
  }
}

function parseArguments(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      throw new RouteError(422, "Tool arguments must be valid JSON.");
    }
  }
  throw new RouteError(422, "Tool arguments must be a JSON object.");
}

function parseCall(value: unknown): VapiToolCall | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const fn = raw.function && typeof raw.function === "object"
    ? (raw.function as Record<string, unknown>)
    : null;
  const id = typeof raw.id === "string"
    ? raw.id
    : typeof raw.toolCallId === "string"
      ? raw.toolCallId
      : "";
  const name = typeof fn?.name === "string"
    ? fn.name
    : typeof raw.name === "string"
      ? raw.name
      : "";
  const args = fn?.arguments ?? raw.arguments ?? raw.parameters;

  if (!id || !name) return null;
  return { id, name, arguments: parseArguments(args) };
}

export function extractVapiToolCalls(body: unknown): VapiToolCall[] {
  if (!body || typeof body !== "object") {
    throw new RouteError(400, "Invalid Vapi webhook body.");
  }
  const envelope = body as VapiEnvelope;
  const candidates = [
    envelope.message?.toolCallList,
    envelope.message?.toolCalls,
    envelope.toolCallList,
    envelope.toolCalls,
  ];
  const rawCalls = candidates.find(Array.isArray);
  if (!Array.isArray(rawCalls)) {
    throw new RouteError(422, "No Vapi tool calls were found in the request.");
  }
  const calls = rawCalls.map(parseCall).filter((call): call is VapiToolCall => Boolean(call));
  if (!calls.length) {
    throw new RouteError(422, "No valid Vapi tool calls were found in the request.");
  }
  return calls;
}

function callerNumberFromEnvelope(body: unknown): string {
  const envelope = body as VapiEnvelope;
  const raw =
    envelope.message?.customer?.number ??
    envelope.message?.call?.customer?.number ??
    envelope.customer?.number ??
    envelope.call?.customer?.number ??
    null;
  if (!raw) {
    throw new RouteError(401, "The caller phone number was not provided by Vapi.");
  }
  return raw;
}

function phoneVariants(input: string): string[] {
  const raw = input.trim();
  const digits = raw.replace(/\D/g, "");
  const lastTen = digits.length >= 10 ? digits.slice(-10) : digits;
  const values = new Set<string>([raw, digits, lastTen]);
  if (lastTen.length === 10) {
    values.add(`+1${lastTen}`);
    values.add(`1${lastTen}`);
    values.add(`(${lastTen.slice(0, 3)}) ${lastTen.slice(3, 6)}-${lastTen.slice(6)}`);
    values.add(`${lastTen.slice(0, 3)}-${lastTen.slice(3, 6)}-${lastTen.slice(6)}`);
  }
  return [...values].filter(Boolean);
}

async function resolveProvider(body: unknown): Promise<Profile> {
  const admin = createSupabaseWebhookAdminClient();
  const variants = phoneVariants(callerNumberFromEnvelope(body));
  const quoted = variants.map((value) => `"${value.replaceAll('"', '\\"')}"`);
  const clauses = ["phone", "phone_number", "whatsapp_number"]
    .flatMap((field) => quoted.map((value) => `${field}.eq.${value}`))
    .join(",");

  const { data, error } = await admin
    .from("profiles")
    .select(profileSelect)
    .or(clauses)
    .limit(2);

  if (error) throw new RouteError(500, error.message);
  if (!data?.length) {
    throw new RouteError(404, "No MasseurMatch provider account matches the verified caller number.");
  }
  if (data.length > 1) {
    throw new RouteError(409, "Multiple provider accounts match this phone number. Human verification is required.");
  }
  return data[0] as Profile;
}

function publicProfile(profile: Profile) {
  return {
    id: profile.id,
    displayName: profile.display_name ?? profile.full_name,
    headline: profile.headline,
    tagline: profile.tagline,
    bio: profile.bio,
    city: profile.city,
    state: profile.state,
    neighborhood: profile.neighborhood,
    techniques: profile.massage_techniques ?? [],
    specialties: profile.specialties ?? [],
    languages: profile.languages ?? [],
    offersIncall: profile.offers_incall,
    offersOutcall: profile.offers_outcall,
    startingPrice: profile.starting_price,
    incallPrice: profile.incall_price,
    outcallPrice: profile.outcall_price,
    pricingSessions: profile.pricing_sessions,
    studioHours: profile.studio_hours,
    mobileHours: profile.mobile_hours,
    availabilityNote: profile.availability_note,
    travelSchedule: profile.travel_schedule,
    profileStatus: profile.profile_status,
    visibilityStatus: profile.visibility_status,
    verificationStatus: profile.verification_status,
    subscriptionTier: profile.subscription_tier,
    subscriptionStatus: profile.subscription_status,
    updatedAt: profile.updated_at,
  };
}

async function updateProfile(profile: Profile, updates: ProfileUpdate, action: string) {
  const admin = createSupabaseWebhookAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", profile.id)
    .eq("user_id", profile.user_id)
    .select(profileSelect)
    .single();
  if (error) throw new RouteError(500, error.message);
  await recordAuditLog(profile.user_id ?? profile.id, action, "profile", profile.id, {
    source: "knotty_vapi",
    fields: Object.keys(updates),
  });
  return data as Profile;
}

async function getCompletion(profile: Profile) {
  const admin = createSupabaseWebhookAdminClient();
  const { count } = await admin
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  const checks = {
    display_name: Boolean(profile.display_name ?? profile.full_name),
    bio: Boolean(profile.bio && profile.bio.trim().length >= 80),
    location: Boolean(profile.city),
    techniques: Boolean(profile.massage_techniques?.length),
    languages: Boolean(profile.languages?.length),
    service_type: Boolean(profile.offers_incall || profile.offers_outcall),
    rates: Boolean(profile.starting_price || profile.incall_price || profile.outcall_price || profile.pricing_sessions),
    availability: Boolean(profile.studio_hours || profile.mobile_hours || profile.availability_note),
    photo: Boolean(count && count > 0),
  };
  const completed = Object.entries(checks).filter(([, value]) => value).map(([key]) => key);
  const missing = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  const calculatedPercent = Math.round((completed.length / Object.keys(checks).length) * 100);

  return {
    completionPercent:
      profile.completion_percentage ??
      profile.profile_completion_score ??
      profile.profile_completeness ??
      calculatedPercent,
    calculatedPercent,
    completed,
    missing,
  };
}

const updateFieldSchema = writeConfirmationSchema.extend({
  field: z.enum([
    "display_name",
    "headline",
    "tagline",
    "bio",
    "city",
    "state",
    "neighborhood",
    "massage_techniques",
    "specialties",
    "languages",
    "offers_incall",
    "offers_outcall",
    "availability_note",
  ]),
  value: z.unknown(),
});

function validatedFieldUpdate(args: unknown): ProfileUpdate {
  const parsed = updateFieldSchema.parse(args);
  const field = parsed.field;
  if (["offers_incall", "offers_outcall"].includes(field)) {
    return { [field]: z.boolean().parse(parsed.value) } as ProfileUpdate;
  }
  if (["massage_techniques", "specialties", "languages"].includes(field)) {
    return { [field]: stringList.parse(parsed.value) } as ProfileUpdate;
  }
  const max = field === "bio" ? 4000 : field === "headline" ? 160 : 200;
  const value = z.string().trim().min(1).max(max).parse(parsed.value);
  return { [field]: value } as ProfileUpdate;
}

async function createSupportTicket(profile: Profile, args: unknown, handoff = false) {
  const schema = writeConfirmationSchema.extend({
    subject: shortString.optional(),
    message: safeString,
    category: z.enum(["general", "billing", "account", "technical", "profile", "other"]).default("general"),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  });
  const parsed = schema.parse(args);
  const admin = createSupabaseWebhookAdminClient();
  const subject = parsed.subject ?? (handoff ? "Knotty human support request" : "Knotty support request");
  const { data: ticket, error: ticketError } = await admin
    .from("support_tickets")
    .insert({
      user_id: profile.user_id ?? profile.id,
      profile_id: profile.id,
      subject,
      category: parsed.category,
      priority: handoff && parsed.priority === "normal" ? "high" : parsed.priority,
      status: "open",
    })
    .select("id,subject,category,priority,status,created_at")
    .single();
  if (ticketError || !ticket) throw new RouteError(500, ticketError?.message ?? "Could not create ticket.");

  const { error: messageError } = await admin.from("support_ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: profile.user_id ?? profile.id,
    sender_role: "user",
    body: `[Knotty ${handoff ? "human handoff" : "voice/SMS support"}] ${parsed.message}`,
  });
  if (messageError) {
    await admin.from("support_tickets").delete().eq("id", ticket.id);
    throw new RouteError(500, messageError.message);
  }
  await recordAuditLog(profile.user_id ?? profile.id, handoff ? "knotty.handoff.create" : "knotty.ticket.create", "support_ticket", ticket.id, {
    source: "knotty_vapi",
  });
  return ticket;
}

async function executeTool(profile: Profile, call: VapiToolCall): Promise<unknown> {
  switch (call.name) {
    case "get_provider_profile":
      return { ok: true, profile: publicProfile(profile) };

    case "get_profile_completion":
      return { ok: true, ...(await getCompletion(profile)) };

    case "update_provider_bio": {
      const parsed = writeConfirmationSchema.extend({ bio: safeString }).parse(call.arguments);
      const updated = await updateProfile(profile, { bio: parsed.bio }, "knotty.profile.bio.update");
      return { ok: true, saved: true, profile: publicProfile(updated) };
    }

    case "update_profile_field": {
      const updates = validatedFieldUpdate(call.arguments);
      const updated = await updateProfile(profile, updates, "knotty.profile.field.update");
      return { ok: true, saved: true, updatedFields: Object.keys(updates), profile: publicProfile(updated) };
    }

    case "set_provider_availability": {
      const schema = writeConfirmationSchema.extend({
        studioHours: z.unknown().optional(),
        mobileHours: z.unknown().optional(),
        availabilityNote: z.string().trim().max(1000).nullable().optional(),
      }).refine((value) => value.studioHours !== undefined || value.mobileHours !== undefined || value.availabilityNote !== undefined, {
        message: "At least one availability field is required.",
      });
      const parsed = schema.parse(call.arguments);
      const updates: ProfileUpdate = {
        ...(parsed.studioHours !== undefined ? { studio_hours: parsed.studioHours as Json } : {}),
        ...(parsed.mobileHours !== undefined ? { mobile_hours: parsed.mobileHours as Json } : {}),
        ...(parsed.availabilityNote !== undefined ? { availability_note: parsed.availabilityNote } : {}),
      };
      const updated = await updateProfile(profile, updates, "knotty.profile.availability.update");
      return { ok: true, saved: true, profile: publicProfile(updated) };
    }

    case "update_provider_rates": {
      const rateSchema = z.object({
        minutes: z.number().int().min(15).max(240),
        incallRate: z.number().int().min(0).nullable().optional(),
        outcallRate: z.number().int().min(0).nullable().optional(),
      }).refine((rate) => rate.incallRate != null || rate.outcallRate != null, { message: "Each rate needs an incall or outcall amount." })
        .refine((rate) => (rate.incallRate == null || rate.incallRate <= rate.minutes * 3.5) && (rate.outcallRate == null || rate.outcallRate <= rate.minutes * 3.5), {
          message: "Rates may not exceed $3.50 per minute.",
        });
      const schema = writeConfirmationSchema.extend({ rates: z.array(rateSchema).min(1).max(12) });
      const parsed = schema.parse(call.arguments);
      const startingRates = parsed.rates.flatMap((rate) => [rate.incallRate, rate.outcallRate]).filter((value): value is number => value != null);
      const updates: ProfileUpdate = {
        pricing_sessions: parsed.rates.map((rate) => ({
          minutes: rate.minutes,
          incall_rate: rate.incallRate ?? null,
          outcall_rate: rate.outcallRate ?? null,
        })) as Json,
        starting_price: startingRates.length ? Math.min(...startingRates) : null,
        incall_price: parsed.rates.find((rate) => rate.minutes === 60)?.incallRate ?? parsed.rates[0]?.incallRate ?? null,
        outcall_price: parsed.rates.find((rate) => rate.minutes === 60)?.outcallRate ?? parsed.rates[0]?.outcallRate ?? null,
      };
      const updated = await updateProfile(profile, updates, "knotty.profile.rates.update");
      return { ok: true, saved: true, profile: publicProfile(updated) };
    }

    case "add_visiting_city": {
      const schema = writeConfirmationSchema.extend({
        city: shortString,
        state: z.string().trim().max(120).nullable().optional(),
        startDate: z.string().date(),
        endDate: z.string().date(),
        serviceType: z.enum(["incall", "outcall", "both"]).default("both"),
      }).refine((value) => value.endDate >= value.startDate, { message: "The end date must be on or after the start date." });
      const parsed = schema.parse(call.arguments);
      const existing = Array.isArray(profile.travel_schedule) ? profile.travel_schedule : [];
      const next = [...existing, {
        city: parsed.city,
        state: parsed.state ?? null,
        start_date: parsed.startDate,
        end_date: parsed.endDate,
        service_type: parsed.serviceType,
      }].slice(-20) as Json;
      const updated = await updateProfile(profile, { travel_schedule: next }, "knotty.profile.travel.add");
      return { ok: true, saved: true, profile: publicProfile(updated) };
    }

    case "get_subscription":
      return {
        ok: true,
        subscription: {
          tier: profile.subscription_tier,
          status: profile.subscription_status,
          currentPeriodEnd: profile.subscription_current_period_end,
          cancelAtPeriodEnd: profile.subscription_cancel_at_period_end,
        },
      };

    case "create_support_ticket":
      return { ok: true, ticket: await createSupportTicket(profile, call.arguments) };

    case "request_human_handoff":
      return { ok: true, handoffRequested: true, ticket: await createSupportTicket(profile, call.arguments, true) };

    default:
      throw new RouteError(404, `Unknown Knotty tool: ${call.name}`);
  }
}

export async function handleVapiToolWebhook(body: unknown) {
  const calls = extractVapiToolCalls(body);
  const profile = await resolveProvider(body);
  const results = await Promise.all(calls.map(async (call) => {
    try {
      const output = await executeTool(profile, call);
      return { toolCallId: call.id, result: JSON.stringify(output) };
    } catch (error) {
      const message = error instanceof z.ZodError
        ? error.issues.map((issue) => issue.message).join(" ")
        : error instanceof Error
          ? error.message
          : "The tool request failed.";
      return { toolCallId: call.id, result: JSON.stringify({ ok: false, error: message }) };
    }
  }));
  return { results };
}
