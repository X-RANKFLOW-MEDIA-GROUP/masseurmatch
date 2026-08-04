import { after } from "next/server";
import { z } from "zod";

import { assertRateLimit } from "@/app/_lib/security";
import { SITE_URL } from "@/lib/site";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/api/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { processPendingMigrations } from "@/app/api/migrate/_lib/processor";
import { assertSafePublicUrl } from "@/app/api/migrate/_lib/source-url";

const supportedPlatforms = [
  "rentmasseur",
  "masseurfinder",
  "gaymassagebiz",
  "gaymassages",
  "hotmasseur",
  "gaywellness",
  "travelgay",
  "hiswellness",
  "custom",
] as const;

type SupportedPlatform = (typeof supportedPlatforms)[number];

type NormalizedEntry = {
  platform: SupportedPlatform;
  source_url: string;
};

const requestSchema = z.object({
  profileUrls: z
    .array(
      z.object({
        platform: z.enum(supportedPlatforms),
        url: z.string().trim().url().max(2048),
      }),
    )
    .min(1)
    .max(5),
});

const ACTIVE_STATUSES = ["pending", "in_progress", "manual_review"];

const PLATFORM_HOST_MATCHERS: Record<Exclude<SupportedPlatform, "custom">, string[]> = {
  rentmasseur: ["rentmasseur.com"],
  masseurfinder: ["masseurfinder.com"],
  gaymassagebiz: ["gaymassage.biz"],
  gaymassages: ["gaymassages.com"],
  hotmasseur: ["hotmasseur.com"],
  gaywellness: ["gaywellness.com"],
  travelgay: ["travelgay.com"],
  hiswellness: ["hiswellness.co", "hiswellness.com"],
};

function assertPlatformMatch(platform: SupportedPlatform, url: URL) {
  if (platform === "custom") return;

  const hostname = url.hostname.toLowerCase();
  const allowedHosts = PLATFORM_HOST_MATCHERS[platform];
  const matches = allowedHosts.some(
    (allowedHost) => hostname === allowedHost || hostname.endsWith(`.${allowedHost}`),
  );

  if (!matches) {
    throw new RouteError(400, "The selected directory does not match the profile link.");
  }
}

async function getProviderProfile(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email_address")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new RouteError(500, "Could not load your provider profile.");
  }

  if (!profile) {
    throw new RouteError(404, "Complete your provider profile before importing reviews.");
  }

  return profile;
}

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const admin = createSupabaseAdminClient();
    const profile = await getProviderProfile(admin, session.userId);

    const { data, error } = await (admin as any)
      .from("profile_migrations")
      .select(
        "id, platform, source_url, status, imported_review_count, is_verified, created_at, updated_at, completed_at",
      )
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      throw new RouteError(500, "Could not load your review imports.");
    }

    return json({ ok: true, imports: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "pro-profile-import", { limit: 8, windowMs: 60_000 });

    const session = await requireRequestSession(request);
    const parsed = requestSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      throw new RouteError(400, parsed.error.issues[0]?.message || "Add at least one valid profile link.");
    }

    const admin = createSupabaseAdminClient();
    const profile = await getProviderProfile(admin, session.userId);
    const email = session.email || profile.email_address;

    if (!email) {
      throw new RouteError(400, "Add an email address to your account before requesting an import.");
    }

    const normalized: NormalizedEntry[] = await Promise.all(
      parsed.data.profileUrls.map(async (entry) => {
        const url = await assertSafePublicUrl(entry.url);
        assertPlatformMatch(entry.platform, url);
        return {
          platform: entry.platform,
          source_url: url.toString(),
        };
      }),
    );

    const uniqueByUrl: NormalizedEntry[] = Array.from(
      new Map<string, NormalizedEntry>(
        normalized.map((entry) => [entry.source_url.toLowerCase(), entry]),
      ).values(),
    );

    const { data: existing, error: existingError } = await (admin as any)
      .from("profile_migrations")
      .select("source_url, status")
      .eq("profile_id", profile.id)
      .in("status", ACTIVE_STATUSES);

    if (existingError) {
      throw new RouteError(500, "Could not verify your existing import requests.");
    }

    const activeUrls = new Set(
      (existing ?? []).map((entry: { source_url: string }) => entry.source_url.toLowerCase()),
    );
    const newEntries = uniqueByUrl.filter((entry) => !activeUrls.has(entry.source_url.toLowerCase()));

    if (newEntries.length === 0) {
      throw new RouteError(409, "That profile link already has an active import request.");
    }

    const now = new Date().toISOString();
    const rows = newEntries.map((entry) => ({
      email,
      profile_id: profile.id,
      platform: entry.platform,
      source_url: entry.source_url,
      status: "pending",
      created_at: now,
    }));

    const { error: insertError } = await (admin as any)
      .from("profile_migrations")
      .insert(rows);

    if (insertError) {
      throw new RouteError(500, "Could not submit your review import request.");
    }

    after(async () => {
      const results = await Promise.allSettled([
        processPendingMigrations(),
        notifyAdmin({
          subject: `New profile import request from ${email}`,
          heading: "Profile import requested",
          intro: "A provider submitted external profile links for review import.",
          fields: [
            { label: "Provider email", value: email },
            { label: "Profile ID", value: profile.id },
            { label: "Requests", value: String(rows.length) },
            { label: "Platforms", value: rows.map((row) => row.platform).join(", ") },
          ],
          message: rows.map((row) => row.source_url).join("\n"),
          action: { label: "Review imports", url: `${SITE_URL}/admin/migrations` },
          replyTo: email,
        }),
      ]);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[api/pro/profile-import] Background task ${index + 1} failed:`, result.reason);
        }
      });
    });

    return json({
      ok: true,
      submitted: rows.length,
      message:
        rows.length === 1
          ? "Your review import request was submitted."
          : `${rows.length} review import requests were submitted.`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
