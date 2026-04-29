import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/components";
import WeeklyNewsletterEmail from "@/emails/WeeklyNewsletterEmail";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "http://placeholder.supabase.invalid",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "placeholder-key",
);

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "MasseurMatch <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://masseurmatch.com";

// POST – trigger the weekly newsletter
// Protected by CRON_SECRET header for automated invocation (e.g. Vercel Cron)
export async function POST(request: NextRequest) {
  // Authorization: either bearer token or x-cron-secret header
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");

  if (CRON_SECRET) {
    const provided =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cronHeader;
    if (provided !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const resend = new Resend(RESEND_API_KEY);

  // 1. Fetch available-now therapists (limited to top 4 for the email)
  const nowIso = new Date().toISOString();
  const { data: availableNowRows } = await supabase
    .from("profiles")
    .select("id, slug, display_name, full_name, city, modality, specialties, avatar_url, available_now_expires")
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .eq("available_now", true)
    .or(`available_now_expires.is.null,available_now_expires.gt.${nowIso}`)
    .order("profile_views", { ascending: false })
    .limit(4);

  const availableNow = (availableNowRows ?? []).map((t, index) => {
    const minutesLeft = t.available_now_expires
      ? Math.max(0, Math.round((new Date(t.available_now_expires).getTime() - Date.now()) / 60_000))
      : undefined;
    return {
      id: t.id,
      name: t.display_name || t.full_name || "Therapist",
      city: t.city || "United States",
      specialty: (t.specialties as string[] | null)?.[0] || t.modality || "Massage",
      profileUrl: `${APP_URL}/therapists/${t.slug || t.id}`,
      imageUrl: t.avatar_url ?? undefined,
      availableMinutesLeft: minutesLeft,
      badge: "Available Now",
    };
  });

  // 2. Fetch therapists with upcoming travel (visiting soon)
  const tomorrowIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const twoWeeksIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: travelRows } = await supabase
    .from("profiles")
    .select("id, slug, display_name, full_name, city, modality, specialties, avatar_url, travel_schedule")
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .not("travel_schedule", "is", null)
    .limit(20);

  interface TravelEntry { city: string; state?: string; start_date: string; end_date: string }

  const visitingSoonItems: Array<{
    id: string;
    name: string;
    city: string;
    region?: string;
    specialty: string;
    profileUrl: string;
    imageUrl?: string;
    badge: string;
  }> = [];

  for (const row of travelRows ?? []) {
    if (visitingSoonItems.length >= 4) break;
    const schedule = Array.isArray(row.travel_schedule) ? (row.travel_schedule as TravelEntry[]) : [];
    const upcomingTrip = schedule.find(
      (trip) =>
        trip.start_date >= tomorrowIso &&
        trip.start_date <= twoWeeksIso,
    );
    if (!upcomingTrip) continue;
    visitingSoonItems.push({
      id: row.id,
      name: row.display_name || row.full_name || "Therapist",
      city: upcomingTrip.city,
      region: upcomingTrip.state,
      specialty: (row.specialties as string[] | null)?.[0] || row.modality || "Massage",
      profileUrl: `${APP_URL}/therapists/${row.slug || row.id}`,
      imageUrl: row.avatar_url ?? undefined,
      badge: "Visiting Soon",
    });
  }

  // 3. Fetch newsletter subscribers
  const { data: subscribers } = await supabase
    .from("users")
    .select("id, email, display_name, full_name")
    .eq("newsletter_subscribed", true)
    .not("email", "is", null)
    .limit(500);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ success: true, sent: 0, message: "No subscribers found" });
  }

  // 4. Fetch favorites availability (for personalization — aggregate for this batch)
  // For scalability: in production, personalize per user via queue.
  // Here we include a shared "favorites were available" section using recently-active profiles.
  const { data: recentlyActiveRows } = await supabase
    .from("profiles")
    .select("id, slug, display_name, full_name, city, available_now_expires")
    .or("is_active.eq.true,is_active.is.null")
    .in("status", ["active", "approved"])
    .not("available_now_expires", "is", null)
    .order("available_now_expires", { ascending: false })
    .limit(4);

  const favoritesAvailable = (recentlyActiveRows ?? []).map((t) => ({
    therapistName: t.display_name || t.full_name || "Therapist",
    city: t.city || "United States",
    profileUrl: `${APP_URL}/therapists/${t.slug || t.id}`,
    wasAvailableAt: t.available_now_expires
      ? new Date(t.available_now_expires).toLocaleString("en-US", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Recently",
  }));

  // 5. Send emails in batches of 10
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const subscriber of subscribers) {
    try {
      const userName =
        subscriber.display_name || subscriber.full_name || subscriber.email.split("@")[0];

      const html = await render(
        WeeklyNewsletterEmail({
          appUrl: APP_URL,
          userName,
          logoUrl: `${APP_URL}/favicon.ico`,
          managePreferencesUrl: `${APP_URL}/client/dashboard/settings`,
          unsubscribeUrl: `${APP_URL}/unsubscribe?userId=${subscriber.id}`,
          availableNow,
          visitingSoon: visitingSoonItems,
          favoritesAvailable,
        }),
      );

      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: subscriber.email,
        subject: "🗓️ Your weekly newsletter – Available Now & Visiting Soon",
        html,
      });

      if (result.error) {
        failed++;
        errors.push(`${subscriber.email}: ${result.error.message}`);
      } else {
        sent++;
      }
    } catch (err) {
      failed++;
      errors.push(
        `${subscriber.email}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: subscribers.length,
    ...(errors.length > 0 ? { errors: errors.slice(0, 10) } : {}),
  });
}
