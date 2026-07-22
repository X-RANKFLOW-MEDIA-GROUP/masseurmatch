import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { assertRateLimit } from "@/app/_lib/security";
import { requireRequestSession } from "@/app/_lib/session";
import { getAvailableNowProfile, recordAuditLog, setAvailableNow } from "@/app/_lib/store";
import { AVAILABLE_NOW_RULES, formatDuration, normalizeProviderTier } from "@/lib/provider-product-rules";
import { z } from "zod";

const activateSchema = z.object({ activate: z.boolean() });

function remainingSeconds(expiresAt: Date, now: Date) {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
}

async function assertDailyActivationAllowance(userId: string, maximum: number | null) {
  if (maximum === null) return;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const admin = createSupabaseAdminClient();
  const { count, error } = await admin
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .eq("admin_user_id", userId)
    .eq("action", "provider.available_now.activate")
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    // Do not break availability when audit history is temporarily unavailable.
    console.error("[available-now] could not read daily activation count", error.message);
    return;
  }

  if ((count || 0) >= maximum) {
    throw new RouteError(
      403,
      `Your plan includes ${maximum} Available Now activations per day. You can activate it again tomorrow.`,
      "AVAILABLE_NOW_DAILY_LIMIT",
    );
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-available-now", { limit: 20, windowMs: 60_000 });

    const session = requireRequestSession(request);
    const body = await parseJsonBody(request, activateSchema);
    const profile = await getAvailableNowProfile(session.userId);
    if (!profile) throw new RouteError(404, "Profile not found.");

    const tier = normalizeProviderTier(profile.subscription_tier);
    const rules = AVAILABLE_NOW_RULES[tier];
    const now = new Date();
    const currentExpiry = profile.available_now_expires ? new Date(profile.available_now_expires) : null;
    const hasValidFutureExpiry = Boolean(
      currentExpiry && !Number.isNaN(currentExpiry.getTime()) && currentExpiry > now,
    );

    if (!body.activate) {
      await setAvailableNow(session.userId, {
        available_now: false,
        available_now_expires: hasValidFutureExpiry && currentExpiry ? currentExpiry.toISOString() : null,
      });

      await recordAuditLog(session.userId, "provider.available_now.deactivate", "profile", profile.id, {
        tier,
        cooldownUntil: hasValidFutureExpiry && currentExpiry ? currentExpiry.toISOString() : null,
      });

      return json({
        ok: true,
        available_now: false,
        cooldown_until: hasValidFutureExpiry && currentExpiry ? currentExpiry.toISOString() : null,
        remaining_seconds: hasValidFutureExpiry && currentExpiry ? remainingSeconds(currentExpiry, now) : 0,
      });
    }

    if (hasValidFutureExpiry && currentExpiry) {
      throw new RouteError(
        409,
        `Your previous Available Now window is still running. You can activate it again after ${currentExpiry.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`,
        "AVAILABLE_NOW_COOLDOWN",
      );
    }

    await assertDailyActivationAllowance(session.userId, rules.activationsPerDay);

    if (profile.available_now) {
      await setAvailableNow(session.userId, { available_now: false, available_now_expires: null });
    }

    const expiresAt = new Date(now.getTime() + rules.durationMinutes * 60_000);

    await setAvailableNow(session.userId, {
      available_now: true,
      available_now_expires: expiresAt.toISOString(),
    });

    await recordAuditLog(session.userId, "provider.available_now.activate", "profile", profile.id, {
      tier,
      durationMinutes: rules.durationMinutes,
      expiresAt: expiresAt.toISOString(),
    });

    return json({
      ok: true,
      available_now: true,
      expires_at: expiresAt.toISOString(),
      duration_minutes: rules.durationMinutes,
      duration_label: formatDuration(rules.durationMinutes),
      activations_per_day: rules.activationsPerDay,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
