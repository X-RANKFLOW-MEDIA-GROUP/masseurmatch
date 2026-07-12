import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// These analytics tables are writable only by the service role — the browser
// anon client is denied by RLS (403 / 42501), which used to log a console
// error on every search and profile view. The service role key never exists
// in the browser bundle, so:
//   • On the server (service role present) we insert directly.
//   • In the browser we POST to /api/analytics/legacy, which performs the
//     insert server-side with the service key.
let cachedClient: SupabaseClient | null = null;
function getServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  if (!cachedClient) cachedClient = createClient(url, serviceKey);
  return cachedClient;
}

type LegacyEventType = "search" | "profile_view" | "inquiry" | "booking";

const TABLE_BY_TYPE: Record<LegacyEventType, string> = {
  search: "search_analytics",
  profile_view: "profile_view_analytics",
  inquiry: "inquiry_analytics",
  booking: "booking_analytics",
};

// Route a legacy analytics row to Supabase: directly on the server, or via the
// server API route from the browser. Never throws — analytics must not disrupt
// the user experience, and the `user_ip` column is filled server-side.
async function persist(type: LegacyEventType, row: Record<string, unknown>) {
  try {
    const server = getServerClient();
    if (server) {
      const { error } = await server.from(TABLE_BY_TYPE[type]).insert([row]);
      if (error) console.error(`Error tracking ${type}:`, error);
      return;
    }

    if (typeof window === "undefined") return;

    const body = JSON.stringify({ type, data: row });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/analytics/legacy", blob)) return;
    }
    await fetch("/api/analytics/legacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics failures must never affect the user experience.
  }
}

interface SearchEventData {
  query: string;
  city?: string;
  state?: string;
  zip_code?: string;
  filters?: Record<string, unknown>;
  user_ip?: string;
}

interface ProfileViewEventData {
  profile_id: string;
  viewer_city?: string;
  viewer_state?: string;
  viewer_zip?: string;
  source: "search" | "explore" | "direct" | "recommendation";
  referrer?: string;
  user_ip?: string;
  session_id?: string;
}

interface InquiryEventData {
  profile_id: string;
  inquiry_type: "call" | "text" | "email" | "contact_form";
  technique_requested?: string;
  session_type?: "incall" | "outcall" | "hotel";
  user_city?: string;
  user_state?: string;
  user_zip?: string;
  user_ip?: string;
  session_id?: string;
}

interface BookingEventData {
  profile_id: string;
  technique?: string;
  session_type: "incall" | "outcall" | "hotel";
  session_duration_minutes?: number;
  location_city?: string;
  location_state?: string;
  location_zip?: string;
  price?: number;
  user_ip?: string;
}

// Demo/fallback profiles carry synthetic ids like "fallback-bruno-santos".
// Their page views must never reach the analytics tables, whose profile_id
// columns are uuid — the insert fails with 22P02 and logs a console error on
// every fallback profile view.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isTrackableProfileId(profileId: string) {
  return UUID_RE.test(profileId);
}

export async function trackSearch(data: SearchEventData) {
  await persist("search", {
    query: data.query,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    filters: data.filters,
  });
}

export async function trackProfileView(data: ProfileViewEventData) {
  if (!isTrackableProfileId(data.profile_id)) return;
  await persist("profile_view", {
    profile_id: data.profile_id,
    viewer_city: data.viewer_city,
    viewer_state: data.viewer_state,
    viewer_zip: data.viewer_zip,
    source: data.source,
    referrer: data.referrer,
    session_id: data.session_id,
  });
}

export async function trackInquiry(data: InquiryEventData) {
  if (!isTrackableProfileId(data.profile_id)) return;
  await persist("inquiry", {
    profile_id: data.profile_id,
    inquiry_type: data.inquiry_type,
    technique_requested: data.technique_requested,
    session_type: data.session_type,
    user_city: data.user_city,
    user_state: data.user_state,
    user_zip: data.user_zip,
    session_id: data.session_id,
  });
}

export async function trackBooking(data: BookingEventData) {
  if (!isTrackableProfileId(data.profile_id)) return;
  await persist("booking", {
    profile_id: data.profile_id,
    technique: data.technique,
    session_type: data.session_type,
    session_duration_minutes: data.session_duration_minutes,
    location_city: data.location_city,
    location_state: data.location_state,
    location_zip: data.location_zip,
    price: data.price,
  });
}
