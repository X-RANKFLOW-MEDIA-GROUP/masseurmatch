import { z } from "zod";
import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const patchSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().min(120).max(1000).optional().or(z.literal("")),
  tagline: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  neighborhood: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  website: z.string().url().max(200).optional().or(z.literal("")),
  specialties: z.array(z.string()).optional(),
  sessionLengths: z.array(z.number().int().positive()).optional(),
  startingPrice: z.number().int().min(0).optional().nullable(),
  incallPrice: z.number().int().min(0).optional().nullable(),
  outcallPrice: z.number().int().min(0).optional().nullable(),
  locationType: z.enum(["incall", "outcall", "both"]).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional().nullable(),
  languages: z.array(z.string()).optional(),
  heightInches: z.number().int().min(48).max(96).optional().nullable(),
  weightLb: z.number().int().min(80).max(400).optional().nullable(),
  bodyType: z.string().max(50).optional().or(z.literal("")),
  smsEnabled: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const adminClient = createSupabaseAdminClient();

    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!profile) throw new RouteError(404, "Profile not found.");

    return json({ ok: true, profile });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession(request);
    const body = await parseJsonBody(request, patchSchema);
    const adminClient = createSupabaseAdminClient();

    const updatePayload: Record<string, unknown> = {};
    if (body.displayName !== undefined) updatePayload.display_name = body.displayName;
    if (body.bio !== undefined) updatePayload.bio = body.bio || null;
    if (body.tagline !== undefined) updatePayload.headline = body.tagline || null;
    if (body.city !== undefined) updatePayload.city = body.city;
    if (body.state !== undefined) updatePayload.state = body.state;
    if (body.neighborhood !== undefined) updatePayload.neighborhood = body.neighborhood || null;
    if (body.phone !== undefined) updatePayload.phone = body.phone || null;
    if (body.whatsapp !== undefined) updatePayload.whatsapp = body.whatsapp || null;
    if (body.website !== undefined) updatePayload.website = body.website || null;
    if (body.specialties !== undefined) updatePayload.service_categories = body.specialties;
    if (body.startingPrice !== undefined) updatePayload.starting_price = body.startingPrice;
    if (body.incallPrice !== undefined) updatePayload.incall_price = body.incallPrice;
    if (body.outcallPrice !== undefined) updatePayload.outcall_price = body.outcallPrice;
    if (body.sessionLengths !== undefined) updatePayload.session_lengths = body.sessionLengths;
    if (body.locationType !== undefined) updatePayload.location_type = body.locationType;
    if (body.yearsExperience !== undefined) updatePayload.years_experience = body.yearsExperience;
    if (body.heightInches !== undefined) updatePayload.height_inches = body.heightInches;
    if (body.weightLb !== undefined) updatePayload.weight_lb = body.weightLb;
    if (body.bodyType !== undefined) updatePayload.body_type = body.bodyType || null;
    if (body.smsEnabled !== undefined) updatePayload.sms_enabled = body.smsEnabled;
    if (body.languages !== undefined) updatePayload.languages_spoken = body.languages;
    updatePayload.updated_at = new Date().toISOString();

    const { data: updated, error } = await adminClient
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", session.userId)
      .select("*")
      .single();

    if (error) throw new RouteError(500, error.message);

    return json({ ok: true, profile: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
