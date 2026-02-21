import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, template } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) {
      throw new Error("User not found or no email");
    }

    const email = userData.user.email;

    // Get profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, full_name")
      .eq("user_id", user_id)
      .single();

    const name = profile?.display_name || profile?.full_name || "there";

    let subject = "";
    let body = "";

    switch (template) {
      case "profile_approved":
        subject = "Your profile is now live! 🎉";
        body = `Hi ${name},\n\nGreat news! Your profile has been reviewed and approved. It is now visible in the directory.\n\nLog in to your dashboard to manage your profile, photos, and availability.\n\nBest regards,\nThe MasseurMatch Team`;
        break;
      case "welcome":
        subject = "Welcome to MasseurMatch!";
        body = `Hi ${name},\n\nWelcome to MasseurMatch! We're excited to have you on board.\n\nTo get started, complete your profile, upload professional photos, and verify your identity. Once everything is reviewed and approved, your profile will go live.\n\nBest regards,\nThe MasseurMatch Team`;
        break;
      case "profile_rejected":
        subject = "Profile review update";
        body = `Hi ${name},\n\nYour profile has been reviewed and requires some changes before it can go live. Please log in to your dashboard, review the feedback, and update your profile.\n\nBest regards,\nThe MasseurMatch Team`;
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    // Log the email intent (actual sending requires an email provider like Resend)
    console.log(`[EMAIL] To: ${email}, Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);

    // TODO: When email provider (Resend) is configured, send the actual email here
    // For now, we log it and return success

    return new Response(
      JSON.stringify({ success: true, message: "Email notification logged", to: email, subject }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Notification email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
