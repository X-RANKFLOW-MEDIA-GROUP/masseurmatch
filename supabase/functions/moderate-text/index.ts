import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apiUser = Deno.env.get('SIGHTENGINE_API_USER');
    const apiSecret = Deno.env.get('SIGHTENGINE_API_SECRET');

    if (!apiUser || !apiSecret) throw new Error('SightEngine credentials not configured');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid user');

    const { profile_id, text, field_name } = await req.json();
    if (!profile_id || !text) throw new Error('Missing profile_id or text');

    // SightEngine text moderation
    const params = new URLSearchParams({
      text: text,
      lang: 'en,pt,es,fr',
      models: 'nudity,link,personal,medical',
      mode: 'rules',
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const seResponse = await fetch(`https://api.sightengine.com/1.0/text/check.json?${params}`);
    const seResult = await seResponse.json();

    if (seResult.status !== 'success') {
      throw new Error(`SightEngine error: ${JSON.stringify(seResult)}`);
    }

    const moderationResult = evaluateTextResult(seResult);

    return new Response(JSON.stringify({
      approved: moderationResult.approved,
      reason: moderationResult.reason,
      flagged_items: moderationResult.flagged_items,
      field_name: field_name || 'text',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Text moderation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function evaluateTextResult(result: any): { approved: boolean; reason: string; flagged_items: string[] } {
  const flagged: string[] = [];

  // Check nudity/sexual text
  if (result.nudity?.matches?.length > 0) {
    flagged.push(...result.nudity.matches.map((m: any) => `sexual: "${m.match}"`));
  }

  // Check for links (possible spam/ads)
  if (result.link?.matches?.length > 0) {
    flagged.push(...result.link.matches.map((m: any) => `link: "${m.match}"`));
  }

  // Check personal info exposure
  if (result.personal?.matches?.length > 0) {
    flagged.push(...result.personal.matches.map((m: any) => `personal_info: "${m.match}"`));
  }

  if (flagged.length > 0) {
    return {
      approved: false,
      reason: `Flagged content: ${flagged.join('; ')}`,
      flagged_items: flagged,
    };
  }

  return { approved: true, reason: 'Text passed all content checks', flagged_items: [] };
}
