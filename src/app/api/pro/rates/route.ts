import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient, recordAuditLog } from "@/app/api/_lib/supabase-server";
import { isRateWithinLimit, MAX_RATE_PER_MINUTE } from "@/lib/provider-product-rules";

const pricingModeSchema = z.enum(["simple", "technique", "ask_me"]);

const pricingSessionSchema = z.object({
  id: z.string().min(1).max(120).optional(),
  mode: pricingModeSchema,
  technique: z.string().trim().max(120).nullable().optional(),
  minutes: z.number().int().min(1).max(600),
  incall_rate: z.number().min(0).max(100000).nullable(),
  outcall_rate: z.number().min(0).max(100000).nullable(),
  incall_ask_me: z.boolean().default(false),
  outcall_ask_me: z.boolean().default(false),
});

const ratesSchema = z.object({
  mode: pricingModeSchema,
  sessions: z.array(pricingSessionSchema).min(1).max(60),
});

type PricingSession = z.infer<typeof pricingSessionSchema>;

function normalizeSessions(mode: z.infer<typeof pricingModeSchema>, sessions: PricingSession[]) {
  if (mode === "ask_me") {
    return [{
      id: sessions[0]?.id || "ask-me",
      mode: "ask_me" as const,
      technique: null,
      minutes: sessions[0]?.minutes || 60,
      incall_rate: null,
      outcall_rate: null,
      incall_ask_me: true,
      outcall_ask_me: true,
    }];
  }

  return sessions.map((session, index) => {
    if (mode === "technique" && !session.technique?.trim()) {
      throw new RouteError(422, `Technique is required for rate row ${index + 1}.`, "RATE_TECHNIQUE_REQUIRED");
    }

    if (!session.incall_ask_me && session.incall_rate === null) {
      throw new RouteError(422, `Enter an incall rate or select Ask Me for row ${index + 1}.`, "RATE_INCALL_REQUIRED");
    }
    if (!session.outcall_ask_me && session.outcall_rate === null) {
      throw new RouteError(422, `Enter an outcall rate or select Ask Me for row ${index + 1}.`, "RATE_OUTCALL_REQUIRED");
    }

    if (!session.incall_ask_me && !isRateWithinLimit(session.minutes, session.incall_rate)) {
      throw new RouteError(
        422,
        `The incall rate for ${session.minutes} minutes exceeds US$${MAX_RATE_PER_MINUTE.toFixed(2)} per minute. Lower the rate or select Ask Me.`,
        "RATE_LIMIT_EXCEEDED",
      );
    }
    if (!session.outcall_ask_me && !isRateWithinLimit(session.minutes, session.outcall_rate)) {
      throw new RouteError(
        422,
        `The outcall rate for ${session.minutes} minutes exceeds US$${MAX_RATE_PER_MINUTE.toFixed(2)} per minute. Lower the rate or select Ask Me.`,
        "RATE_LIMIT_EXCEEDED",
      );
    }

    return {
      ...session,
      id: session.id || `rate-${index + 1}`,
      mode,
      technique: mode === "technique" ? session.technique?.trim() || null : null,
      incall_rate: session.incall_ask_me ? null : session.incall_rate,
      outcall_rate: session.outcall_ask_me ? null : session.outcall_rate,
    };
  });
}

function deriveLegacyPrices(sessions: ReturnType<typeof normalizeSessions>) {
  const incall = sessions
    .map((session) => session.incall_rate)
    .filter((value): value is number => typeof value === "number");
  const outcall = sessions
    .map((session) => session.outcall_rate)
    .filter((value): value is number => typeof value === "number");
  const all = [...incall, ...outcall];

  return {
    incall_price: incall.length ? Math.min(...incall) : null,
    outcall_price: outcall.length ? Math.min(...outcall) : null,
    starting_price: all.length ? Math.min(...all) : null,
  };
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("id, pricing_sessions, incall_price, outcall_price")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!data) throw new RouteError(404, "Profile not found.");

    return json({ ok: true, profile: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const body = await parseJsonBody(request, ratesSchema);
    const normalized = normalizeSessions(body.mode, body.sessions);
    const legacyPrices = deriveLegacyPrices(normalized);
    const admin = createSupabaseAdminClient();

    const { data: existing, error: existingError } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (existingError) throw new RouteError(500, existingError.message);
    if (!existing) throw new RouteError(404, "Profile not found.");

    const { data, error } = await admin
      .from("profiles")
      .update({
        pricing_sessions: normalized,
        ...legacyPrices,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.userId)
      .select("id, pricing_sessions, incall_price, outcall_price")
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);

    await recordAuditLog(session.userId, "provider.rates.update", "profile", existing.id, {
      mode: body.mode,
      rows: normalized.length,
    });

    return json({ ok: true, profile: data });
  } catch (error) {
    return errorResponse(error);
  }
}
