import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

// The legacy analytics tables (search_analytics, profile_view_analytics,
// inquiry_analytics, booking_analytics) are written only by the service role;
// the browser anon client is denied by RLS (403 / 42501). Client code POSTs
// here so the insert happens server-side with the service key. The admin
// keyword-trends / aggregation reporting continues to read these tables.

const uuid = z.string().uuid();

const searchData = z.object({
  query: z.string().trim().min(1).max(300),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  zip_code: z.string().trim().max(20).optional(),
  filters: z.record(z.unknown()).optional(),
});

const profileViewData = z.object({
  profile_id: uuid,
  viewer_city: z.string().trim().max(120).optional(),
  viewer_state: z.string().trim().max(120).optional(),
  viewer_zip: z.string().trim().max(20).optional(),
  source: z.enum(["search", "explore", "direct", "recommendation"]),
  referrer: z.string().trim().max(500).optional(),
  session_id: z.string().trim().max(120).optional(),
});

const inquiryData = z.object({
  profile_id: uuid,
  inquiry_type: z.enum(["call", "text", "email", "contact_form"]),
  technique_requested: z.string().trim().max(120).optional(),
  session_type: z.enum(["incall", "outcall", "hotel"]).optional(),
  user_city: z.string().trim().max(120).optional(),
  user_state: z.string().trim().max(120).optional(),
  user_zip: z.string().trim().max(20).optional(),
  session_id: z.string().trim().max(120).optional(),
});

const bookingData = z.object({
  profile_id: uuid,
  technique: z.string().trim().max(120).optional(),
  session_type: z.enum(["incall", "outcall", "hotel"]),
  session_duration_minutes: z.number().int().positive().max(1440).optional(),
  location_city: z.string().trim().max(120).optional(),
  location_state: z.string().trim().max(120).optional(),
  location_zip: z.string().trim().max(20).optional(),
  price: z.number().nonnegative().max(100000).optional(),
});

const bodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("search"), data: searchData }),
  z.object({ type: z.literal("profile_view"), data: profileViewData }),
  z.object({ type: z.literal("inquiry"), data: inquiryData }),
  z.object({ type: z.literal("booking"), data: bookingData }),
]);

const TABLE_BY_TYPE = {
  search: "search_analytics",
  profile_view: "profile_view_analytics",
  inquiry: "inquiry_analytics",
  booking: "booking_analytics",
} as const;

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  // No service role configured (e.g. preview without secrets): accept and drop
  // rather than surfacing an error to the client.
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 202 });
  }

  const { type, data } = parsed.data;
  const row = { ...data, user_ip: clientIp(request) };

  const { error } = await supabase.from(TABLE_BY_TYPE[type]).insert([row]);
  if (error) {
    console.error(`Legacy analytics insert failed (${type})`, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
