import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Generate a Cloudinary upload signature.
// See: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
async function signCloudinaryUpload(params: Record<string, string | number>, apiSecret: string): Promise<string> {
  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const toSign = paramString + apiSecret;
  const encoder = new TextEncoder();
  const data = encoder.encode(toSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the caller — must be a logged-in therapist.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Support both direct credentials and cloudinary:// URL format
    let cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    let apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    let apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

    // If credentials come as a cloudinary:// URL, parse them
    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://")) {
      try {
        const urlObj = new URL(cloudinaryUrl);
        apiKey = urlObj.username;
        apiSecret = urlObj.password;
        cloudName = urlObj.hostname;
      } catch {
        // Fall through to direct credentials
      }
    }

    // Alternatively, if api_key contains the full URL format, extract it
    if (apiKey?.includes("cloudinary://")) {
      try {
        const urlObj = new URL(apiKey);
        apiKey = urlObj.username;
        apiSecret = urlObj.password;
        cloudName = urlObj.hostname;
      } catch {
        // Invalid format, will fail below
      }
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "Cloudinary is not configured on this server." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `masseurmatch/profiles/${user.id}`;

    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    const signature = await signCloudinaryUpload(paramsToSign, apiSecret);

    return new Response(
      JSON.stringify({ cloud_name: cloudName, api_key: apiKey, timestamp, folder, signature }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
