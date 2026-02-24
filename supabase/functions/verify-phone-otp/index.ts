import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) throw new Error('Unauthorized');

    const { phone, otp } = await req.json();
    if (!phone || !otp) throw new Error('Phone and OTP are required');

    const cleanPhone = phone.replace(/[^+\d]/g, '');

    // Hash the provided OTP
    const encoder = new TextEncoder();
    const data = encoder.encode(otp + cleanPhone);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Find matching verification record
    const { data: verifications, error: fetchError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone', cleanPhone)
      .eq('otp_hash', otpHash)
      .is('verified_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (!verifications || verifications.length === 0) {
      // Increment attempts on latest record
      const { data: latest } = await supabase
        .from('phone_verifications')
        .select('id, attempts, max_attempts')
        .eq('user_id', user.id)
        .eq('phone', cleanPhone)
        .is('verified_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (latest && latest.length > 0) {
        await supabase
          .from('phone_verifications')
          .update({ attempts: latest[0].attempts + 1 })
          .eq('id', latest[0].id);

        if (latest[0].attempts + 1 >= latest[0].max_attempts) {
          throw new Error('Too many failed attempts. Please request a new code.');
        }
      }

      throw new Error('Invalid or expired verification code.');
    }

    // Mark as verified
    await supabase
      .from('phone_verifications')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verifications[0].id);

    // Update profile
    await supabase
      .from('profiles')
      .update({ 
        is_verified_phone: true,
        phone: cleanPhone,
      })
      .eq('user_id', user.id);

    console.log('Phone verified for user:', user.id);

    return new Response(JSON.stringify({ success: true, verified: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return new Response(JSON.stringify({ error: error.message, verified: false }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
