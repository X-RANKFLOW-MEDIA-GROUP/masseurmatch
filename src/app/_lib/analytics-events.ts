import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// This module is imported by client components (e.g. SearchPageClient), so it
// must never reference the service-role key: it is absent in the browser
// (crashing the page at module load) and must not ship in the bundle anyway.
// The client is created lazily with whatever key the current runtime has, and
// tracking becomes a no-op when none is available.
let client: SupabaseClient | null = null;

function getAnalyticsClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    typeof window === "undefined"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
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

export async function trackSearch(data: SearchEventData) {
  try {
    const supabase = getAnalyticsClient();
    if (!supabase) return;

    const { error } = await supabase.from("search_analytics").insert([
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
  try {
    const supabase = getAnalyticsClient();
    if (!supabase) return;

    const { error } = await supabase.from("profile_view_analytics").insert([
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
  try {
    const supabase = getAnalyticsClient();
    if (!supabase) return;

    const { error } = await supabase.from("inquiry_analytics").insert([
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
  try {
    const supabase = getAnalyticsClient();
    if (!supabase) return;

    const { error } = await supabase.from("booking_analytics").insert([
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
