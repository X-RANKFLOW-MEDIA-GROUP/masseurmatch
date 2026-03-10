import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[TRIAL-REMINDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const REMINDER_DAYS = [7, 5, 3, 0];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // List all trialing subscriptions
    const trialing = await stripe.subscriptions.list({
      status: "trialing",
      limit: 100,
    });

    logStep("Found trialing subscriptions", { count: trialing.data.length });

    let emailsSent = 0;

    for (const sub of trialing.data) {
      if (!sub.trial_end) continue;

      const trialEndDate = new Date(sub.trial_end * 1000);
      const now = new Date();
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if today matches one of our reminder days
      if (!REMINDER_DAYS.includes(daysLeft)) continue;

      const userId = sub.metadata?.user_id;
      if (!userId) {
        logStep("Skipping sub without user_id", { subId: sub.id });
        continue;
      }

      // Get user profile name
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("display_name, full_name")
        .eq("user_id", userId)
        .single();

      const name = profile?.display_name || profile?.full_name || "there";
      const planKey = sub.metadata?.masseurmatch_plan || "Standard";
      const trialEndFormatted = trialEndDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // Send the reminder email via send-notification-email
      const template = daysLeft === 0 ? "trial_expired" : "trial_ending_soon";

      const emailPayload = {
        user_id: userId,
        template,
        data: {
          name,
          plan: planKey.charAt(0).toUpperCase() + planKey.slice(1),
          trial_end: trialEndFormatted,
          days_left: String(daysLeft),
        },
      };

      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnon}`,
        },
        body: JSON.stringify(emailPayload),
      });

      if (emailRes.ok) {
        emailsSent++;
        logStep("Sent reminder", { userId, daysLeft, template });
      } else {
        logStep("Failed to send reminder", { userId, status: emailRes.status });
      }
    }

    logStep("Completed", { emailsSent });

    return new Response(JSON.stringify({ success: true, emails_sent: emailsSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
