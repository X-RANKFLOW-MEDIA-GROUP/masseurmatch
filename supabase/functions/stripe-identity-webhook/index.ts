import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const event = body;

    console.log('Stripe webhook event:', event.type);

    if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object;
      const sessionId = session.id;

      // Update verification record
      await supabase.from('identity_verifications')
        .update({ status: 'verified', stripe_report: session })
        .eq('stripe_session_id', sessionId);

      // Update profile
      await supabase.from('profiles')
        .update({ is_verified_identity: true })
        .eq('stripe_verification_session_id', sessionId);

      console.log('Identity verified for session:', sessionId);
    } else if (event.type === 'identity.verification_session.requires_input') {
      const session = event.data.object;
      await supabase.from('identity_verifications')
        .update({ status: 'failed', stripe_report: session })
        .eq('stripe_session_id', session.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
