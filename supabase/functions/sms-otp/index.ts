import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_VERIFY_SERVICE_SID = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      return new Response(
        JSON.stringify({ error: "Twilio credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, phone: rawPhone, code } = await req.json();
    // Ensure E.164 format with + prefix
    const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    if (action === "send") {
      // Send OTP via Twilio Verify
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: phone, Channel: "sms" }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Twilio send error:", data);
        return new Response(
          JSON.stringify({ error: data.message || "Failed to send OTP" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, status: data.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      // Verify OTP
      const res = await fetch(
        `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: phone, Code: code }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.status !== "approved") {
        return new Response(
          JSON.stringify({ error: "Invalid or expired code", valid: false }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // OTP verified — look up user by phone in profiles table
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Find profile with this phone number
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("phone", phone)
        .eq("is_active", true)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: "No account found with this phone number. Please sign up first.", valid: true, authenticated: false }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user email to generate magic link
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.user_id);
      if (userError || !userData?.user?.email) {
        return new Response(
          JSON.stringify({ error: "Could not retrieve user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate a magic link for the user
      const { data: magicLink, error: magicError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: userData.user.email,
      });

      if (magicError || !magicLink) {
        return new Response(
          JSON.stringify({ error: "Could not generate login session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return the hashed token so client can verify with it
      return new Response(
        JSON.stringify({
          valid: true,
          authenticated: true,
          token_hash: magicLink.properties?.hashed_token,
          email: userData.user.email,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("SMS OTP error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
