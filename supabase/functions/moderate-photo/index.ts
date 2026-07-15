import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

import { checkRateLimit, getClientKey, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_MODELS = [
  "nudity-2.1",
  "weapon",
  "gore-2.0",
  "offensive",
  "text-content-2.0",
  // Returns a per-face "minor" probability, used to keep any image that may
  // depict a minor out of auto-approval and escalate it to human review.
  "face-attributes",
] as const;

// A face scoring at or above this is treated as possibly a minor and forces
// human review. Kept conservative because youthful-looking adults false-positive;
// a false flag only means a reviewer approves it manually.
const MINOR_REVIEW_THRESHOLD = 0.5;
// Any hint of a minor combined with a sexual/suggestive signal is escalated as a
// potential CSAM case, at a lower threshold given the severity.
const MINOR_CSAM_THRESHOLD = 0.3;

const IMAGE_TEXT_CATEGORIES = [
  "sexual",
  "insult",
  "inappropriate",
  "discriminatory",
  "phone_number",
  "email",
  "link",
] as const;

const LANGUAGE_HINTS = "en,pt,es,fr,de,it";
const COUNTRY_HINTS = "us,ca,gb,br,pt,es,fr,de,it,mx";

type ModeratePhotoPayload = {
  photo_id?: string;
  image_url?: string;
  image_base64?: string;
};

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
  isPrimary: boolean;
  sortOrder: number | null;
  displayName: string | null;
};

type SightengineImageResponse = {
  status?: string;
  error?: {
    code?: number | string;
    message?: string;
  };
  nudity?: Record<string, number>;
  weapon?: number;
  gore?: number;
  offensive?: number;
  text?: {
    detected_categories?: string[];
    detections?: Record<string, { details?: Array<{ match?: string; severity?: string; category?: string }> }>;
  };
  faces?: Array<{ attributes?: { minor?: number } }>;
};

function getCredentials() {
  const apiUser = Deno.env.get("SIGHTENGINE_API_USER") ?? "";
  const apiSecret = Deno.env.get("SIGHTENGINE_API_SECRET") ?? "";

  if (!apiUser || !apiSecret) {
    throw new Error("Sightengine credentials are not configured.");
  }

  return { apiUser, apiSecret };
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function decodeBase64(base64: string) {
  const normalized = base64.includes(",") ? base64.split(",").pop() ?? "" : base64;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function createRequestBody(payload: ModeratePhotoPayload, apiUser: string, apiSecret: string) {
  const formData = new FormData();
  formData.append("models", IMAGE_MODELS.join(","));
  formData.append("text_categories", IMAGE_TEXT_CATEGORIES.join(","));
  formData.append("opt_lang", LANGUAGE_HINTS);
  formData.append("opt_countries", COUNTRY_HINTS);
  formData.append("api_user", apiUser);
  formData.append("api_secret", apiSecret);

  if (payload.image_url) {
    formData.append("url", payload.image_url);
  } else if (payload.image_base64) {
    const bytes = decodeBase64(payload.image_base64);
    formData.append("media", new Blob([bytes], { type: "image/jpeg" }), "upload.jpg");
  } else {
    throw new Error("image_url or image_base64 is required.");
  }

  return formData;
}

function toPercent(value: number | undefined) {
  return Math.round((value ?? 0) * 100);
}

function decideModeration(data: SightengineImageResponse): ModerationDecision {
  const flags: string[] = [];
  const nudity = data.nudity ?? {};

  if ((nudity.sexual_activity ?? 0) >= 0.12) {
    flags.push(`sexual_activity:${toPercent(nudity.sexual_activity)}%`);
  }

  if ((nudity.sexual_display ?? 0) >= 0.12) {
    flags.push(`sexual_display:${toPercent(nudity.sexual_display)}%`);
  }

  if ((nudity.erotica ?? 0) >= 0.2) {
    flags.push(`erotica:${toPercent(nudity.erotica)}%`);
  }

  if ((nudity.very_suggestive ?? 0) >= 0.6) {
    flags.push(`very_suggestive:${toPercent(nudity.very_suggestive)}%`);
  }

  if ((data.weapon ?? 0) >= 0.5) {
    flags.push(`weapon:${toPercent(data.weapon)}%`);
  }

  if ((data.gore ?? 0) >= 0.35) {
    flags.push(`gore:${toPercent(data.gore)}%`);
  }

  if ((data.offensive ?? 0) >= 0.4) {
    flags.push(`offensive:${toPercent(data.offensive)}%`);
  }

  const textCategories = data.text?.detected_categories ?? [];
  if (textCategories.length > 0) {
    flags.push(`embedded_text:${textCategories.slice(0, 4).join(",")}`);
  }

  // Minor / CSAM screening. Take the highest per-face minor probability.
  const minorScore = (data.faces ?? []).reduce(
    (max, face) => Math.max(max, face.attributes?.minor ?? 0),
    0,
  );
  const hasSexualSignal =
    (nudity.sexual_activity ?? 0) >= 0.12 ||
    (nudity.sexual_display ?? 0) >= 0.12 ||
    (nudity.erotica ?? 0) >= 0.2 ||
    (nudity.very_suggestive ?? 0) >= 0.6;

  let priority: "normal" | "high" = "normal";
  let csamSuspected = false;

  if (minorScore >= MINOR_CSAM_THRESHOLD && hasSexualSignal) {
    // Potential child sexual abuse material — highest severity, never auto-approve.
    csamSuspected = true;
    priority = "high";
    flags.push(`CSAM_SUSPECTED:minor:${toPercent(minorScore)}%`);
  } else if (minorScore >= MINOR_REVIEW_THRESHOLD) {
    // Possible minor with no sexual signal — still requires human confirmation.
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

async function persistModeration(photoId: string | undefined, decision: ModerationDecision) {
  if (!photoId) {
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return;
  }

  await supabaseAdmin
    .from("profile_photos")
    .update({
      moderation_status: decision.approved ? "approved" : "pending",
      moderation_reason: decision.reason,
    })
    .eq("id", photoId);
}

async function getPhotoQueueContext(photoId: string | undefined): Promise<PhotoQueueContext | null> {
  if (!photoId) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return null;
  }

  const { data: photo, error: photoError } = await supabaseAdmin
    .from("profile_photos")
    .select("id, profile_id, storage_path, url, is_primary, sort_order")
    .eq("id", photoId)
    .maybeSingle();

  if (photoError || !photo) {
    return null;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, user_id, display_name, full_name")
    .eq("id", photo.profile_id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return {
    photoId: photo.id,
    profileId: photo.profile_id,
    userId: profile.user_id ?? null,
    imageUrl: photo.storage_path || photo.url || null,
    isPrimary: Boolean(photo.is_primary),
    sortOrder: typeof photo.sort_order === "number" ? photo.sort_order : null,
    displayName: profile.display_name || profile.full_name || null,
  };
}

async function syncModerationQueue(
  photoId: string | undefined,
  decision: ModerationDecision,
  provider = "sightengine",
) {
  const context = await getPhotoQueueContext(photoId);
  if (!context?.userId) {
    return;
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return;
  }

  const pendingStatus = decision.approved ? "approved" : "pending";
  const snapshot = {
    photoId: context.photoId,
    imageUrl: context.imageUrl,
    isPrimary: context.isPrimary,
    sortOrder: context.sortOrder,
    displayName: context.displayName,
  };

  const { data: existingQueueItem } = await supabaseAdmin
    .from("moderation_queue")
    .select("id")
    .eq("item_type", "photo")
    .eq("source", "pro_photos")
    .eq("target_id", context.photoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const queuePayload = {
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

  if (existingQueueItem?.id) {
    await supabaseAdmin.from("moderation_queue").update(queuePayload).eq("id", existingQueueItem.id);
    return;
  }

  await supabaseAdmin.from("moderation_queue").insert(queuePayload);
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rl = checkRateLimit(getClientKey(request), { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  }

  try {
    const payload = (await request.json()) as ModeratePhotoPayload;
    const { apiUser, apiSecret } = getCredentials();
    const formData = createRequestBody(payload, apiUser, apiSecret);

    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as SightengineImageResponse;
    if (!response.ok || data.status !== "success") {
      throw new Error(data.error?.message || `Sightengine photo moderation failed (${response.status}).`);
    }

    const decision = decideModeration(data);
    await persistModeration(payload.photo_id, decision);
    await syncModerationQueue(payload.photo_id, decision);

    return new Response(
      JSON.stringify({
        approved: decision.approved,
        reason: decision.reason,
        provider: "sightengine",
        flags: decision.flags,
        priority: decision.priority,
        csam_suspected: decision.csamSuspected,
        photo_id: payload.photo_id ?? null,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
