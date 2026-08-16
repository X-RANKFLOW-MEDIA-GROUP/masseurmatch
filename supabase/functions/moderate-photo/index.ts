import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

import { checkRateLimit, getClientKey, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_MODELS = ["nudity-2.1", "weapon", "gore-2.0", "offensive", "text-content-2.0", "face-attributes"] as const;
const MINOR_REVIEW_THRESHOLD = 0.5;
const MINOR_CSAM_THRESHOLD = 0.3;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IMAGE_TEXT_CATEGORIES = ["sexual", "insult", "inappropriate", "discriminatory", "phone_number", "email", "link"] as const;
const LANGUAGE_HINTS = "en,pt,es,fr,de,it";
const COUNTRY_HINTS = "us,ca,gb,br,pt,es,fr,de,it,mx";
const PENDING_BUCKET = "pending-photos";
const PUBLIC_BUCKET = "therapist-photos";

type ModeratePhotoPayload = { photo_id?: string; image_url?: string; image_base64?: string };
type ModerationDecision = {
  approved: boolean;
  reason: string;
  flags: string[];
  priority: "normal" | "high";
  csamSuspected: boolean;
};
type PhotoQueueContext = {
  photoId: string;
  profileId: string;
  userId: string | null;
  imageUrl: string | null;
  storageBucket: string;
  storagePath: string | null;
  isPrimary: boolean;
  sortOrder: number | null;
  displayName: string | null;
};
type SightengineImageResponse = {
  status?: string;
  error?: { code?: number | string; message?: string };
  nudity?: Record<string, number>;
  weapon?: number;
  gore?: number;
  offensive?: number;
  text?: { detected_categories?: string[]; detections?: Record<string, { details?: Array<{ match?: string; severity?: string; category?: string }> }> };
  faces?: Array<{ attributes?: { minor?: number } }>;
};

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function getCredentials() {
  const apiUser = Deno.env.get("SIGHTENGINE_API_USER") ?? "";
  const apiSecret = Deno.env.get("SIGHTENGINE_API_SECRET") ?? "";
  if (!apiUser || !apiSecret) throw new HttpError(503, "Photo moderation is temporarily unavailable.");
  return { apiUser, apiSecret };
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceRoleKey) throw new HttpError(503, "Photo moderation backend is not configured.");
  return {
    client: createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } }),
    serviceRoleKey,
  };
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

async function authenticateRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) throw new HttpError(401, "Authentication required.");
  const { client, serviceRoleKey } = getSupabaseAdmin();
  if (token === serviceRoleKey) return { client, kind: "service" as const, userId: null as string | null };
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new HttpError(401, "Invalid or expired authentication token.");
  return { client, kind: "user" as const, userId: user.id };
}

function toPercent(value: number | undefined) {
  return Math.round((value ?? 0) * 100);
}

function decideModeration(data: SightengineImageResponse): ModerationDecision {
  const flags: string[] = [];
  const nudity = data.nudity ?? {};
  if ((nudity.sexual_activity ?? 0) >= 0.12) flags.push(`sexual_activity:${toPercent(nudity.sexual_activity)}%`);
  if ((nudity.sexual_display ?? 0) >= 0.12) flags.push(`sexual_display:${toPercent(nudity.sexual_display)}%`);
  if ((nudity.erotica ?? 0) >= 0.2) flags.push(`erotica:${toPercent(nudity.erotica)}%`);
  if ((nudity.very_suggestive ?? 0) >= 0.6) flags.push(`very_suggestive:${toPercent(nudity.very_suggestive)}%`);
  if ((data.weapon ?? 0) >= 0.5) flags.push(`weapon:${toPercent(data.weapon)}%`);
  if ((data.gore ?? 0) >= 0.35) flags.push(`gore:${toPercent(data.gore)}%`);
  if ((data.offensive ?? 0) >= 0.4) flags.push(`offensive:${toPercent(data.offensive)}%`);
  const textCategories = data.text?.detected_categories ?? [];
  if (textCategories.length > 0) flags.push(`embedded_text:${textCategories.slice(0, 4).join(",")}`);

  const minorScore = (data.faces ?? []).reduce((max, face) => Math.max(max, face.attributes?.minor ?? 0), 0);
  const hasSexualSignal =
    (nudity.sexual_activity ?? 0) >= 0.12 ||
    (nudity.sexual_display ?? 0) >= 0.12 ||
    (nudity.erotica ?? 0) >= 0.2 ||
    (nudity.very_suggestive ?? 0) >= 0.6;
  let priority: "normal" | "high" = "normal";
  let csamSuspected = false;
  if (minorScore >= MINOR_CSAM_THRESHOLD && hasSexualSignal) {
    csamSuspected = true;
    priority = "high";
    flags.push(`CSAM_SUSPECTED:minor:${toPercent(minorScore)}%`);
  } else if (minorScore >= MINOR_REVIEW_THRESHOLD) {
    priority = "high";
    flags.push(`possible_minor:${toPercent(minorScore)}%`);
  }
  return {
    approved: flags.length === 0,
    reason: flags.length === 0 ? "safe" : flags.join("; "),
    flags,
    priority,
    csamSuspected,
  };
}

async function getPhotoQueueContext(client: ReturnType<typeof createClient>, photoId: string): Promise<PhotoQueueContext> {
  const { data: photo, error: photoError } = await client
    .from("profile_photos")
    .select("id, profile_id, storage_bucket, storage_path, url, is_primary, sort_order")
    .eq("id", photoId)
    .maybeSingle();
  if (photoError) throw new HttpError(500, "Could not load the photo for moderation.");
  if (!photo) throw new HttpError(404, "Photo not found.");

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id, user_id, display_name, full_name")
    .eq("id", photo.profile_id)
    .maybeSingle();
  if (profileError) throw new HttpError(500, "Could not load the photo owner.");
  if (!profile) throw new HttpError(409, "Photo is not linked to a valid profile.");

  const storageBucket = String(photo.storage_bucket || "external");
  const storagePath = typeof photo.storage_path === "string" && photo.storage_path.trim() ? photo.storage_path.trim() : null;
  let imageUrl = typeof photo.url === "string" && /^https?:\/\//i.test(photo.url) ? photo.url : null;

  if (!imageUrl && storagePath && storageBucket === PENDING_BUCKET) {
    const { data, error } = await client.storage.from(PENDING_BUCKET).createSignedUrl(storagePath, 300);
    if (error) throw new HttpError(500, "Could not create a private moderation URL.");
    imageUrl = data?.signedUrl ?? null;
  } else if (!imageUrl && storagePath && storageBucket === PUBLIC_BUCKET) {
    const { data } = client.storage.from(PUBLIC_BUCKET).getPublicUrl(storagePath);
    imageUrl = data?.publicUrl || null;
  } else if (!imageUrl && storagePath && /^https?:\/\//i.test(storagePath)) {
    imageUrl = storagePath;
  }

  return {
    photoId: photo.id,
    profileId: photo.profile_id,
    userId: profile.user_id ?? null,
    imageUrl,
    storageBucket,
    storagePath,
    isPrimary: Boolean(photo.is_primary),
    sortOrder: typeof photo.sort_order === "number" ? photo.sort_order : null,
    displayName: profile.display_name || profile.full_name || null,
  };
}

function createRequestBody(imageUrl: string, apiUser: string, apiSecret: string) {
  const formData = new FormData();
  formData.append("models", IMAGE_MODELS.join(","));
  formData.append("text_categories", IMAGE_TEXT_CATEGORIES.join(","));
  formData.append("opt_lang", LANGUAGE_HINTS);
  formData.append("opt_countries", COUNTRY_HINTS);
  formData.append("api_user", apiUser);
  formData.append("api_secret", apiSecret);
  formData.append("url", imageUrl);
  return formData;
}

async function promoteApprovedPhoto(client: ReturnType<typeof createClient>, context: PhotoQueueContext) {
  if (context.storageBucket !== PENDING_BUCKET || !context.storagePath) return;

  const { data: blob, error: downloadError } = await client.storage.from(PENDING_BUCKET).download(context.storagePath);
  if (downloadError || !blob) throw new HttpError(500, "Approved photo could not be read from private storage.");

  const { error: uploadError } = await client.storage.from(PUBLIC_BUCKET).upload(context.storagePath, blob, {
    contentType: blob.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new HttpError(500, "Approved photo could not be published.");

  const { data: publicData } = client.storage.from(PUBLIC_BUCKET).getPublicUrl(context.storagePath);
  const publicUrl = publicData?.publicUrl ?? null;
  if (!publicUrl) {
    await client.storage.from(PUBLIC_BUCKET).remove([context.storagePath]);
    throw new HttpError(500, "Approved photo did not receive a public URL.");
  }

  const { error: updateError } = await client
    .from("profile_photos")
    .update({ storage_bucket: PUBLIC_BUCKET, storage_path: context.storagePath, url: publicUrl })
    .eq("id", context.photoId);
  if (updateError) {
    await client.storage.from(PUBLIC_BUCKET).remove([context.storagePath]);
    throw new HttpError(500, "Approved photo publication could not be recorded.");
  }

  await client.storage.from(PENDING_BUCKET).remove([context.storagePath]);
  context.storageBucket = PUBLIC_BUCKET;
  context.imageUrl = publicUrl;
}

async function persistModeration(client: ReturnType<typeof createClient>, photoId: string, decision: ModerationDecision) {
  const { error } = await client
    .from("profile_photos")
    .update({ moderation_status: decision.approved ? "approved" : "pending", moderation_reason: decision.reason })
    .eq("id", photoId);
  if (error) throw new HttpError(500, "Photo moderation result could not be saved.");
}

async function syncModerationQueue(
  client: ReturnType<typeof createClient>,
  context: PhotoQueueContext,
  decision: ModerationDecision,
  provider = "sightengine",
) {
  if (!context.userId) throw new HttpError(409, "Photo profile has no associated user.");
  const pendingStatus = decision.approved ? "approved" : "pending";
  const snapshot = {
    photoId: context.photoId,
    imageUrl: context.storageBucket === PENDING_BUCKET ? null : context.imageUrl,
    storageBucket: context.storageBucket,
    storagePath: context.storagePath,
    isPrimary: context.isPrimary,
    sortOrder: context.sortOrder,
    displayName: context.displayName,
  };
  const queuePayload = {
    content_type: "photo",
    profile_id: context.profileId,
    user_id: context.userId,
    target_id: context.photoId,
    item_type: "photo",
    source: "pro_photos",
    field_name: null,
    status: pendingStatus,
    priority: decision.priority,
    moderation_provider: provider,
    moderation_reason: decision.reason,
    snapshot,
    ai_response: {
      provider,
      flags: decision.flags,
      approved: decision.approved,
      reason: decision.reason,
      priority: decision.priority,
      csam_suspected: decision.csamSuspected,
    },
    admin_reason: null,
    resolved_by: null,
    resolved_at: decision.approved ? new Date().toISOString() : null,
  };
  const { error } = await client.from("moderation_queue").upsert(queuePayload, { onConflict: "target_id" });
  if (error) console.error("[moderate-photo] Failed to sync moderation queue:", error.message);
}

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const auth = await authenticateRequest(request);
    const rateKey = auth.kind === "user" ? `user:${auth.userId}` : `service:${getClientKey(request)}`;
    const rl = checkRateLimit(rateKey, { limit: auth.kind === "service" ? 120 : 20, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const payload = (await request.json()) as ModeratePhotoPayload;
    const photoId = payload.photo_id?.trim() ?? "";
    if (!UUID_RE.test(photoId)) throw new HttpError(400, "A valid photo_id is required.");

    const context = await getPhotoQueueContext(auth.client, photoId);
    if (auth.kind === "user" && context.userId !== auth.userId) throw new HttpError(403, "You do not have access to this photo.");
    if (!context.imageUrl) throw new HttpError(422, "The stored photo does not have a moderation URL.");

    const { apiUser, apiSecret } = getCredentials();
    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: createRequestBody(context.imageUrl, apiUser, apiSecret),
    });
    const data = (await response.json()) as SightengineImageResponse;
    if (!response.ok || data.status !== "success") {
      throw new HttpError(502, data.error?.message || "Photo moderation provider failed.");
    }

    const decision = decideModeration(data);
    if (decision.approved) await promoteApprovedPhoto(auth.client, context);
    await persistModeration(auth.client, context.photoId, decision);
    await syncModerationQueue(auth.client, context, decision);

    return jsonResponse({
      approved: decision.approved,
      reason: decision.reason,
      provider: "sightengine",
      flags: decision.flags,
      priority: decision.priority,
      csam_suspected: decision.csamSuspected,
      photo_id: context.photoId,
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Photo moderation failed.";
    if (status >= 500) console.error("[moderate-photo]", message);
    return jsonResponse({ error: message }, status);
  }
});
