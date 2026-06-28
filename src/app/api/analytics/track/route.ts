import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

const analyticsPayloadSchema = z.object({
  eventName: z.string().trim().min(2).max(80),
  profileId: z.string().uuid().nullable().optional(),
  sessionId: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(80).nullable().optional(),
  sourcePage: z.string().trim().max(120).nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function sanitizeMetadata(metadata: Record<string, unknown>) {
  const blockedKeys = new Set(["email", "phone", "phone_number", "address", "full_address", "name", "full_name"]);

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !blockedKeys.has(key.toLowerCase()))
      .slice(0, 50),
  );
}

export async function POST(request: Request) {
  const payload = analyticsPayloadSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 202 });
  }

  const headers = request.headers;
  const userAgent = headers.get("user-agent")?.slice(0, 500) ?? null;
  const referrer = headers.get("referer")?.slice(0, 500) ?? null;

  const { error } = await supabase.from("analytics_events").insert({
    event_name: payload.data.eventName,
    profile_id: payload.data.profileId ?? null,
    session_id: payload.data.sessionId ?? null,
    city: payload.data.city ?? null,
    state: payload.data.state ?? null,
    source_page: payload.data.sourcePage ?? null,
    metadata: sanitizeMetadata(payload.data.metadata),
    user_agent: userAgent,
    referrer,
  });

  if (error) {
    console.error("Analytics event insert failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
