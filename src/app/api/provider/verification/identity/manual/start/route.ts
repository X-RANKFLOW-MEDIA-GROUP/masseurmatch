import { randomInt, randomUUID } from "node:crypto";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { isRateLimitedDistributed } from "@/app/api/_lib/rate-limit";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

const CHALLENGE_TTL_MS = 30 * 60 * 1000;

function manualFilePaths(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== "object") return [];
  const manual = (metadata as Record<string, unknown>).manual;
  if (!manual || typeof manual !== "object") return [];
  const files = (manual as Record<string, unknown>).files;
  if (!files || typeof files !== "object") return [];

  return Object.values(files as Record<string, unknown>)
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const path = (entry as Record<string, unknown>).path;
      return typeof path === "string" && path.length > 0 ? path : null;
    })
    .filter((path): path is string => Boolean(path));
}

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const verificationId = new URL(request.url).searchParams.get("verificationId")?.trim() ?? "";
    if (!verificationId) throw new RouteError(400, "verificationId is required.");

    const admin = createSupabaseAdminClient();
    const { data: verification, error } = await admin
      .from("identity_verifications")
      .select("id, user_id, provider, status, metadata")
      .eq("id", verificationId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!verification || verification.provider !== "manual") throw new RouteError(404, "Identity verification not found.");
    if (!["not_started", "pending"].includes(verification.status)) throw new RouteError(409, "This verification is no longer active.");

    const metadata = (verification.metadata ?? {}) as Record<string, unknown>;
    const manual = (metadata.manual ?? {}) as Record<string, unknown>;
    const challengeCode = typeof manual.challengeCode === "string" ? manual.challengeCode : "";
    const expiresAt = typeof manual.expiresAt === "string" ? manual.expiresAt : "";

    if (!challengeCode || !expiresAt) throw new RouteError(409, "Verification challenge is unavailable. Start a new verification.");
    if (Date.parse(expiresAt) <= Date.now()) throw new RouteError(410, "Verification challenge expired. Start a new verification.");

    return json({ ok: true, verificationId, challengeCode, expiresAt });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);

    if (
      await isRateLimitedDistributed(request, {
        keyPrefix: "identity-start",
        windowMs: 60 * 60 * 1000,
        max: 5,
        userId: session.userId,
      })
    ) {
      throw new RouteError(429, "Too many identity verification attempts. Please try again later.");
    }

    const admin = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, profileError.message);
    if (!profile) throw new RouteError(404, "Provider profile not found.");

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS).toISOString();

    const { data: activeAttempts, error: activeError } = await admin
      .from("identity_verifications")
      .select("id, metadata")
      .eq("user_id", session.userId)
      .eq("provider", "manual")
      .in("status", ["not_started", "pending"]);

    if (activeError) throw new RouteError(500, activeError.message);

    for (const attempt of activeAttempts ?? []) {
      const paths = manualFilePaths(attempt.metadata);
      if (paths.length > 0) {
        const { error: removeError } = await admin.storage.from("identity-documents").remove(paths);
        if (removeError) {
          throw new RouteError(500, "Could not securely remove documents from the previous verification attempt.");
        }
      }
    }

    await admin
      .from("identity_verifications")
      .update({ status: "canceled", updated_at: nowIso })
      .eq("user_id", session.userId)
      .eq("provider", "manual")
      .in("status", ["not_started", "pending"]);

    const verificationId = randomUUID();
    const challengeCode = String(randomInt(100000, 1000000));
    const metadata = {
      manual: {
        version: 3,
        challengeCode,
        expiresAt,
        files: {},
        submittedAt: null,
        reviewedAt: null,
        documentsDeletedAt: null,
      },
    };

    const { error: insertError } = await admin.from("identity_verifications").insert({
      id: verificationId,
      user_id: session.userId,
      profile_id: profile.id,
      provider: "manual",
      status: "not_started",
      last_error: null,
      metadata,
      updated_at: nowIso,
    });

    if (insertError) throw new RouteError(500, insertError.message);

    return json({ ok: true, verificationId, expiresAt });
  } catch (error) {
    return errorResponse(error);
  }
}
