import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

function getCredentials(): { apiUser: string; apiSecret: string } | null {
  const apiUser = Deno.env.get("SIGHTENGINE_API_USER") ?? "";
  const apiSecret = Deno.env.get("SIGHTENGINE_API_SECRET") ?? "";
  if (!apiUser || !apiSecret) return null;
  return { apiUser, apiSecret };
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

  const rl = checkRateLimit(getClientKey(request), { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return rateLimitResponse(rl, corsHeaders);
  }

  try {
    const payload = (await request.json()) as ModerateTextPayload;
    const text = payload.text?.trim() ?? "";

    if (!text) {
      return new Response(
        JSON.stringify({
          approved: true,
          reason: "empty_text",
          provider: "sightengine",
          matches: [],
          categories: [],
          field_name: payload.field_name ?? null,
          profile_id: payload.profile_id ?? null,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const creds = getCredentials();
    if (!creds) {
      return new Response(
        JSON.stringify({
          approved: true,
          reason: "moderation_unavailable",
          provider: "none",
          matches: [],
          categories: [],
          field_name: payload.field_name ?? null,
          profile_id: payload.profile_id ?? null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { apiUser, apiSecret } = creds;
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
      throw new Error(data.error?.message || `Sightengine text moderation failed (${response.status}).`);
    }

    const findings = TEXT_CATEGORIES.flatMap((category) => {
      const entry = data[category] as SightengineTextCategory | undefined;
      return (entry?.matches ?? []).map((match) => ({
        category,
        ...match,
      }));
    });

    const approved = findings.length === 0;
    const reason = approved
      ? "safe"
      : findings
          .slice(0, 3)
          .map((match) => normalizeReason(match.category, match))
          .join("; ");

    return new Response(
      JSON.stringify({
        approved,
        reason,
        provider: "sightengine",
        categories: [...new Set(findings.map((item) => item.category))],
        matches: findings.slice(0, 10),
        field_name: payload.field_name ?? null,
        profile_id: payload.profile_id ?? null,
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
