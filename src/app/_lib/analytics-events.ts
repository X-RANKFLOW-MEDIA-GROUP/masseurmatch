import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabase as sharedBrowserClient } from "@/integrations/supabase/client";

// Creating the client at module scope with raw env crashed every client
// bundle that imported this file ("supabaseKey is required"): the service
// role key is never available in the browser. Resolve lazily instead —
// server code gets the service-role client, browser code degrades to the
// shared anon client (writes remain subject to Row Level Security).
let cachedClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cachedClient =
    url && serviceKey
      ? createClient(url, serviceKey)
      : (sharedBrowserClient as unknown as SupabaseClient);
  return cachedClient;
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
  try {
    const { error } = await getSupabase().from("search_analytics").insert([
      {
        query: data.query,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        filters: data.filters,
        user_ip: data.user_ip,
      },
    ]);

    if (error) {
      console.error("Error tracking search:", error);
    }
  } catch (err) {
    console.error("Exception in trackSearch:", err);
  }
}

export async function trackProfileView(data: ProfileViewEventData) {
  if (!isTrackableProfileId(data.profile_id)) return;
  try {
    const { error } = await getSupabase().from("profile_view_analytics").insert([
      {
        profile_id: data.profile_id,
        viewer_city: data.viewer_city,
        viewer_state: data.viewer_state,
        viewer_zip: data.viewer_zip,
        source: data.source,
        referrer: data.referrer,
        user_ip: data.user_ip,
        session_id: data.session_id,
      },
    ]);

    if (error) {
      console.error("Error tracking profile view:", error);
    }
  } catch (err) {
    console.error("Exception in trackProfileView:", err);
  }
}

export async function trackInquiry(data: InquiryEventData) {
  if (!isTrackableProfileId(data.profile_id)) return;
  try {
    const { error } = await getSupabase().from("inquiry_analytics").insert([
      {
        profile_id: data.profile_id,
        inquiry_type: data.inquiry_type,
        technique_requested: data.technique_requested,
        session_type: data.session_type,
        user_city: data.user_city,
        user_state: data.user_state,
        user_zip: data.user_zip,
        user_ip: data.user_ip,
        session_id: data.session_id,
      },
    ]);

    if (error) {
      console.error("Error tracking inquiry:", error);
    }
  } catch (err) {
    console.error("Exception in trackInquiry:", err);
  }
}

export async function trackBooking(data: BookingEventData) {
  if (!isTrackableProfileId(data.profile_id)) return;
  try {
    const { error } = await getSupabase().from("booking_analytics").insert([
      {
        profile_id: data.profile_id,
        technique: data.technique,
        session_type: data.session_type,
        session_duration_minutes: data.session_duration_minutes,
        location_city: data.location_city,
        location_state: data.location_state,
        location_zip: data.location_zip,
        price: data.price,
        user_ip: data.user_ip,
      },
    ]);

    if (error) {
      console.error("Error tracking booking:", error);
    }
  } catch (err) {
    console.error("Exception in trackBooking:", err);
  }
}
