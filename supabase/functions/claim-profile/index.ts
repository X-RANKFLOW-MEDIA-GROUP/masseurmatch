import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Claim a seed profile:
 * - Transfers the seed profile to the authenticated user
 * - Preserves the profile ID (so URLs don't break)
 * - Resets verification flags so the real user must verify
 * - Marks as no longer seed
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");
    const user = userData.user;

    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") throw new Error("Missing slug");

    // Find the seed profile
    const { data: seedProfile, error: findError } = await supabase
      .from("profiles")
      .select("id, user_id, is_seed_profile, seed_claimed_by, display_name, city")
      .eq("seed_slug", slug)
      .eq("is_seed_profile", true)
      .maybeSingle();

    if (findError) throw new Error(`Lookup failed: ${findError.message}`);
    if (!seedProfile) throw new Error("Seed profile not found or already claimed");
    if (seedProfile.seed_claimed_by) throw new Error("This profile has already been claimed");

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("You already have a profile. Contact support to merge profiles.");
    }

    // Transfer the profile to the new user
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        user_id: user.id,
        is_seed_profile: false,
        seed_claimed_by: user.id,
        seed_claimed_at: new Date().toISOString(),
        // Reset verification — real user must go through the process
        is_verified_identity: false,
        is_verified_photos: false,
        is_verified_phone: false,
        is_verified_profile: false,
        // Keep active but mark for re-approval
        status: "pending_approval",
        is_active: false,
      })
      .eq("id", seedProfile.id);

    if (updateError) throw new Error(`Claim failed: ${updateError.message}`);

    // Delete the old seed auth user (cleanup)
    if (seedProfile.user_id !== user.id) {
      await supabase.auth.admin.deleteUser(seedProfile.user_id);
    }

    // Audit log
    await supabase.from("audit_log").insert({
      admin_user_id: user.id,
      action: "seed_profile_claimed",
      target_type: "profile",
      target_id: seedProfile.id,
      details: {
        slug,
        display_name: seedProfile.display_name,
        city: seedProfile.city,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      profile_id: seedProfile.id,
      message: "Profile claimed successfully. Complete verification to activate your listing.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
