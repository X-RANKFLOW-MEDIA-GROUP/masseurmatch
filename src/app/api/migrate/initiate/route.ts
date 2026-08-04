import React from "react";
import { after } from "next/server";
import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import { sendEmail } from "@/app/api/_lib/email";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { processPendingMigrations } from "@/app/api/migrate/_lib/processor";
import { assertSafePublicUrl } from "@/app/api/migrate/_lib/source-url";
import { SITE_URL } from "@/lib/site";

const legacyPlatforms = ["rubmaps", "4corners", "nuru", "custom"] as const;
type LegacyPlatform = (typeof legacyPlatforms)[number];

const requestSchema = z.object({
  profileUrls: z
    .array(
      z.object({
        platform: z.enum(legacyPlatforms),
        url: z.string().trim().url().max(2048),
      }),
    )
    .min(1)
    .max(5),
  // Retained for compatibility with the signup client, but never trusted.
  email: z.string().email().optional(),
});

const platformHosts: Record<Exclude<LegacyPlatform, "custom">, string[]> = {
  rubmaps: ["rubmaps.com"],
  "4corners": ["4corners.xxx"],
  nuru: ["nurumap.com"],
};

function assertPlatformMatch(platform: LegacyPlatform, url: URL) {
  if (platform === "custom") return;

  const hostname = url.hostname.toLowerCase();
  const matches = platformHosts[platform].some(
    (allowedHost) => hostname === allowedHost || hostname.endsWith(`.${allowedHost}`),
  );

  if (!matches) {
    throw new RouteError(400, "The selected directory does not match the profile link.");
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "profile-migration-initiate", { limit: 8, windowMs: 60_000 });
    const session = await requireRequestSession(request);
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      throw new RouteError(400, parsed.error.issues[0]?.message || "Add at least one valid profile link.");
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, email_address")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (profileError) throw new RouteError(500, "Could not load your provider profile.");

    const email = session.email || profile?.email_address;
    if (!email) throw new RouteError(400, "Add an email address to your account before requesting an import.");

    const normalized = await Promise.all(
      parsed.data.profileUrls.map(async (entry) => {
        const url = await assertSafePublicUrl(entry.url);
        assertPlatformMatch(entry.platform, url);
        return { platform: entry.platform, source_url: url.toString() };
      }),
    );
    const uniqueEntries = Array.from(
      new Map(normalized.map((entry) => [entry.source_url.toLowerCase(), entry])).values(),
    );

    const { data: existing, error: existingError } = await (adminClient as any)
      .from("profile_migrations")
      .select("source_url")
      .eq("email", email)
      .in("status", ["pending", "in_progress", "manual_review"]);

    if (existingError) throw new RouteError(500, "Could not verify your existing import requests.");

    const activeUrls = new Set(
      (existing ?? []).map((entry: { source_url: string }) => entry.source_url.toLowerCase()),
    );
    const newEntries = uniqueEntries.filter((entry) => !activeUrls.has(entry.source_url.toLowerCase()));
    if (newEntries.length === 0) {
      throw new RouteError(409, "That profile link already has an active import request.");
    }

    const now = new Date().toISOString();
    const migrationData = newEntries.map((entry) => ({
      email,
      profile_id: profile?.id ?? null,
      platform: entry.platform,
      source_url: entry.source_url,
      status: "pending" as const,
      created_at: now,
    }));

    const { error: insertError } = await (adminClient as any)
      .from("profile_migrations")
      .insert(migrationData);

    if (insertError) {
      console.error("[api/migrate/initiate] Insert error:", insertError.message);
      throw new RouteError(500, "Could not save migration request.");
    }

    after(async () => {
      const results = await Promise.allSettled([
        processPendingMigrations(),
        sendEmail({
          to: email,
          subject: "We're Importing Your Profile — Sit Back & Relax",
          react: React.createElement(
            "div",
            null,
            React.createElement("h1", null, "We received your profile links"),
            React.createElement(
              "p",
              null,
              "MasseurMatch is reviewing your external profiles and imported reviews. Most requests are completed within 24–48 hours.",
            ),
            React.createElement("p", null, "We'll email you when the review is complete."),
          ),
        }),
        notifyAdmin({
          subject: `New signup profile import from ${email}`,
          heading: "Profile import requested during signup",
          fields: [
            { label: "Provider email", value: email },
            { label: "Profile ID", value: profile?.id ?? null },
            { label: "Requests", value: String(migrationData.length) },
            { label: "Platforms", value: migrationData.map((entry) => entry.platform).join(", ") },
          ],
          message: migrationData.map((entry) => entry.source_url).join("\n"),
          action: { label: "Review imports", url: `${SITE_URL}/admin/migrations` },
          replyTo: email,
        }),
      ]);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[api/migrate/initiate] Background task ${index + 1} failed:`, result.reason);
        }
      });
    });

    return json({
      ok: true,
      submitted: migrationData.length,
      message: "Migration request received. You'll be notified when your profile is ready.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
