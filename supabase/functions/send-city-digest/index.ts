import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireScheduledJob, ScheduledJobAuthError } from "../_shared/job-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-mm-job-token",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const { client: supabase } = await requireScheduledJob(req, "send-city-digest");
    const resendApiKey = Deno.env.get("RESEND_API_KEY")?.trim() ?? "";
    if (!resendApiKey) return json({ error: "configuration_error", missing: ["RESEND_API_KEY"] }, 503);

    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, city")
      .eq("is_active", true);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return json({ success: true, message: "No active subscribers." });
    }

    const cityGroups: Record<string, typeof subscribers> = {};
    for (const subscriber of subscribers) {
      const city = subscriber.city?.trim() || "Unknown";
      cityGroups[city] ??= [];
      cityGroups[city].push(subscriber);
    }

    let sent = 0;
    let failed = 0;

    for (const [city, citySubscribers] of Object.entries(cityGroups)) {
      const { data: newTherapists, error: therapistError } = await supabase
        .from("profiles")
        .select("display_name, specialty, specialties, slug")
        .eq("city", city)
        .eq("profile_status", "approved")
        .eq("visibility_status", "public")
        .eq("is_suspended", false)
        .eq("is_banned", false)
        .order("created_at", { ascending: false })
        .limit(2);

      if (therapistError) throw therapistError;

      const therapistList = (newTherapists ?? [])
        .map((therapist) => {
          const specialty = therapist.specialty || therapist.specialties?.[0] || "Massage Therapy";
          return `• ${escapeHtml(therapist.display_name || "MasseurMatch provider")} — ${escapeHtml(specialty)}`;
        })
        .join("\n");

      const safeCity = escapeHtml(city);
      const cityPath = encodeURIComponent(city.toLowerCase());
      const emailPayloads = citySubscribers.map((subscriber) => ({
        from: "MasseurMatch Concierge <concierge@masseurmatch.com>",
        to: subscriber.email,
        subject: `The ${city} Digest: New massage professionals near you.`,
        html: [
          `<h1>Hello ${escapeHtml(subscriber.name || "there")},</h1>`,
          `<p>Here is your curated weekly selection for <strong>${safeCity}</strong>.</p>`,
          therapistList ? `<h2>New Additions</h2><pre>${therapistList}</pre>` : "",
          `<p><a href="https://masseurmatch.com/cities/${cityPath}">View all in ${safeCity} &rarr;</a></p>`,
          `<hr/><p style="font-size:12px;color:#888;">You received this because you subscribed to the ${safeCity} City Digest. <a href="https://masseurmatch.com/unsubscribe">Unsubscribe</a></p>`,
        ].join(""),
      }));

      // Keep each provider request bounded even if a city has a large list.
      for (let start = 0; start < emailPayloads.length; start += 50) {
        const batch = emailPayloads.slice(start, start + 50);
        const response = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          failed += batch.length;
          console.error(`[send-city-digest] Resend batch failed for city ${city}: HTTP ${response.status}`);
        } else {
          sent += batch.length;
        }
      }
    }

    return json({ success: failed === 0, sent, failed });
  } catch (error) {
    const status = error instanceof ScheduledJobAuthError ? error.status : 500;
    const message = error instanceof Error ? error.message : String(error);
    if (status >= 500) console.error("[send-city-digest]", message);
    return json({ error: message }, status);
  }
});
