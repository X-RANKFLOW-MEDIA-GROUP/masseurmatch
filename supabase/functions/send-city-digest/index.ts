// supabase/functions/send-city-digest/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (_req) => {
  try {
    // 1. Fetch all active subscribers grouped by city
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, city")
      .eq("is_active", true);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No active subscribers." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Group subscribers by city to minimize database calls for content
    const cityGroups: Record<string, typeof subscribers> = {};
    for (const sub of subscribers) {
      const city = sub.city ?? "Unknown";
      if (!cityGroups[city]) cityGroups[city] = [];
      cityGroups[city].push(sub);
    }

    // 2. Process each city
    for (const [city, citySubscribers] of Object.entries(cityGroups)) {
      // Fetch newest therapists in this city
      const { data: newTherapists } = await supabase
        .from("profiles")
        .select("display_name, specialty, avatar_url, slug")
        .eq("city", city)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(2);

      const therapistList = (newTherapists ?? [])
        .map((t) => `• ${t.display_name} — ${t.specialty ?? "Massage Therapy"}`)
        .join("\n");

      // 3. Send Email via Resend to all users in this city
      const emailPayloads = citySubscribers.map((sub) => ({
        from: "MasseurMatch Concierge <concierge@masseurmatch.com>",
        to: sub.email,
        subject: `The ${city} Digest: New elite therapists near you.`,
        html: [
          `<h1>Hello ${sub.name ?? "there"},</h1>`,
          `<p>Here is your curated weekly selection for <strong>${city}</strong>.</p>`,
          therapistList
            ? `<h2>New Additions</h2><pre>${therapistList}</pre>`
            : "",
          `<p><a href="https://masseurmatch.com/cities/${encodeURIComponent(city.toLowerCase())}">View all in ${city} &rarr;</a></p>`,
          `<hr/><p style="font-size:12px;color:#888;">You received this because you subscribed to the ${city} City Digest. <a href="https://masseurmatch.com/unsubscribe">Unsubscribe</a></p>`,
        ].join(""),
      }));

      // Fire to Resend in batches
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayloads),
      });

      if (!res.ok) {
        console.error(`Failed to send batch for ${city}: ${res.status} ${await res.text()}`);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Digests dispatched." }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
