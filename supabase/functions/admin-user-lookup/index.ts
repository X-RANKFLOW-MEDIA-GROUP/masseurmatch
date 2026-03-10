import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // Verify caller is admin
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const { data: claimsData, error: claimsErr } = await supabaseAnon.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  const callerUserId = claimsData.claims.sub as string;

  const { data: roleData } = await supabaseAnon
    .from("user_roles")
    .select("role")
    .eq("user_id", callerUserId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleData) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
  }

  // Service role client for auth admin operations
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { action, ...params } = await req.json();

  try {
    let result: unknown;

    switch (action) {
      case "get_user_email": {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(params.user_id);
        if (error) throw new Error(error.message);
        result = { email: data.user?.email || null };
        break;
      }

      case "invite_user": {
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(params.email, {
          data: params.user_metadata || {},
        });
        if (error) throw new Error(error.message);
        result = { user_id: data.user?.id };
        break;
      }

      case "reset_password": {
        // First get user email
        const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(params.user_id);
        if (userErr) throw new Error(userErr.message);
        const email = userData.user?.email;
        if (!email) throw new Error("User email not found");

        // Use anon client to send reset (respects email templates)
        const { error: resetErr } = await supabaseAnon.auth.resetPasswordForEmail(email, {
          redirectTo: params.redirect_to,
        });
        if (resetErr) throw new Error(resetErr.message);
        result = { email, sent: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[admin-user-lookup] ${action} error:`, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
