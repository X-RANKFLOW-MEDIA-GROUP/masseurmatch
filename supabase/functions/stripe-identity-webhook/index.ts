import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Stripe webhook signature verification using HMAC-SHA256
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const signature = parts.find(p => p.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !signature) return false;

  // Reject events older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(timestamp) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSig === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

    const body = await req.text();
    const sigHeader = req.headers.get('stripe-signature');

    if (!sigHeader) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isValid = await verifyStripeSignature(body, sigHeader, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const event = JSON.parse(body);
    console.log('Stripe webhook event:', event.type);

    if (event.type === 'identity.verification_session.verified') {
      const session = event.data.object;
      const sessionId = session.id;

      await supabase.from('identity_verifications')
        .update({ status: 'verified', stripe_report: session })
        .eq('stripe_session_id', sessionId);

      await supabase.from('profiles')
        .update({ is_verified_identity: true, is_verified_phone: true })
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
