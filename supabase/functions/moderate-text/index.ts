import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

import { checkRateLimit, getClientKey, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEXT_CATEGORIES = [
  "profanity",
  "personal",
  "link",
  "drug",
  "weapon",
  "violence",
  "self-harm",
  "extremism",
  "spam",
  "content-trade",
] as const;

const LANGUAGE_HINTS = "en,pt,es,fr,de,it";
const COUNTRY_HINTS = "us,ca,gb,br,pt,es,fr,de,it,mx";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TEXT_LENGTH = 5_000;

type ModerateTextPayload = {
  profile_id?: string;
  text?: string;
  field_name?: string;
};

type SightengineTextMatch = {
  match?: string;
  type?: string;
  intensity?: string;
  category?: string;
};

type SightengineTextCategory = {
  matches?: SightengineTextMatch[];
};

type SightengineTextResponse = {
  status?: string;
  error?: {
    code?: number | string;
    message?: string;
  };
} & Record<string, SightengineTextCategory | unknown>;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceRoleKey) {
    throw new HttpError(503, "Text moderation backend is not configured.");
  }

  return {
    client: createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    serviceRoleKey,
  };
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

async function authenticateRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) throw new HttpError(401, "Authentication required.");

  const { client, serviceRoleKey } = getSupabaseAdmin();
  if (token === serviceRoleKey) {
    return { client, kind: "service" as const, userId: null as string | null };
  }

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);
  if (error || !user) {
    throw new HttpError(401, "Invalid or expired authentication token.");
  }

  return { client, kind: "user" as const, userId: user.id };
}

function getCredentials() {
  const apiUser = Deno.env.get("SIGHTENGINE_API_USER") ?? "";
  const apiSecret = Deno.env.get("SIGHTENGINE_API_SECRET") ?? "";
  if (!apiUser || !apiSecret) {
    throw new HttpError(503, "Text moderation is temporarily unavailable.");
  }
  return { apiUser, apiSecret };
}

async function assertProfileAccess(
  client: ReturnType<typeof createClient>,
  profileId: string,
  auth: { kind: "service" | "user"; userId: string | null },
) {
  const { data: profile, error } = await client
    .from("profiles")
    .select("id, user_id")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw new HttpError(500, "Could not verify profile ownership.");
  if (!profile) throw new HttpError(404, "Profile not found.");
  if (auth.kind === "user" && profile.user_id !== auth.userId) {
    throw new HttpError(403, "You do not have access to this profile.");
  }
}

function normalizeReason(category: string, match: SightengineTextMatch) {
  const token = match.match || match.type || match.category || "policy";
  const severity = match.intensity ? ` (${match.intensity})` : "";
  return `${category}: ${token}${severity}`;
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const auth = await authenticateRequest(request);
    const rateKey = auth.kind === "user" ? `user:${auth.userId}` : `service:${getClientKey(request)}`;
    const rl = checkRateLimit(rateKey, { limit: auth.kind === "service" ? 180 : 30, windowMs: 60_000 });
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const payload = (await request.json()) as ModerateTextPayload;
    const profileId = payload.profile_id?.trim() ?? "";
    if (!UUID_RE.test(profileId)) {
      throw new HttpError(400, "A valid profile_id is required.");
    }

    await assertProfileAccess(auth.client, profileId, auth);

    const text = payload.text?.trim() ?? "";
    if (text.length > MAX_TEXT_LENGTH) {
      throw new HttpError(413, `Text exceeds the ${MAX_TEXT_LENGTH} character moderation limit.`);
    }

    if (!text) {
      return jsonResponse({
        approved: true,
        reason: "empty_text",
        provider: "sightengine",
        matches: [],
        categories: [],
        field_name: payload.field_name ?? null,
        profile_id: profileId,
      });
    }

    const { apiUser, apiSecret } = getCredentials();
    const formData = new FormData();
    formData.append("text", text);
    formData.append("mode", "rules");
    formData.append("categories", TEXT_CATEGORIES.join(","));
    formData.append("lang", LANGUAGE_HINTS);
    formData.append("opt_countries", COUNTRY_HINTS);
    formData.append("opt_phone", "1");
    formData.append("api_user", apiUser);
    formData.append("api_secret", apiSecret);

    const response = await fetch("https://api.sightengine.com/1.0/text/check.json", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as SightengineTextResponse;
    if (!response.ok || data.status !== "success") {
      throw new HttpError(502, data.error?.message || "Text moderation provider failed.");
    }

    const findings = TEXT_CATEGORIES.flatMap((category) => {
      const entry = data[category] as SightengineTextCategory | undefined;
      return (entry?.matches ?? []).map((match) => ({ category, ...match }));
    });

    const approved = findings.length === 0;
    const reason = approved
      ? "safe"
      : findings
          .slice(0, 3)
          .map((match) => normalizeReason(match.category, match))
          .join("; ");

    return jsonResponse({
      approved,
      reason,
      provider: "sightengine",
      categories: [...new Set(findings.map((item) => item.category))],
      matches: findings.slice(0, 10),
      field_name: payload.field_name ?? null,
      profile_id: profileId,
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Text moderation failed.";
    if (status >= 500) console.error("[moderate-text]", message);
    return jsonResponse({ error: message, approved: false }, status);
  }
});
