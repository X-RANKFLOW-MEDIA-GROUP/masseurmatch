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

    const { phone } = await req.json();
    if (!phone) throw new Error('Phone number is required');

    // Normalize phone (basic)
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    if (cleanPhone.length < 10) throw new Error('Invalid phone number');

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Hash OTP for storage (simple hash using Web Crypto)
    const encoder = new TextEncoder();
    const data = encoder.encode(otp + cleanPhone);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store in DB (expires in 10 minutes)
    const { error: insertError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: user.id,
        phone: cleanPhone,
        otp_hash: otpHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      if (insertError.message.includes('Too many')) {
        throw new Error('Too many verification attempts. Please try again later.');
      }
      throw insertError;
    }

    // Send SMS via Twilio
    const twilioSid = (Deno.env.get('TWILIO_ACCOUNT_SID') || '').replace(/[^\x20-\x7E]/g, '');
    const twilioToken = (Deno.env.get('TWILIO_AUTH_TOKEN') || '').replace(/[^\x20-\x7E]/g, '');
    const twilioPhone = (Deno.env.get('TWILIO_PHONE_NUMBER') || '').replace(/[^\x20-\x7E]/g, '');

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

    const smsBody = `Your MasseurMatch verification code is: ${otp}. It expires in 10 minutes. Do not share this code.`;

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: cleanPhone,
        From: twilioPhone,
        Body: smsBody,
      }),
    });

    if (!twilioRes.ok) {
      const errText = await twilioRes.text();
      console.error('Twilio error:', errText);
      // DEV FALLBACK: return OTP in response so it can be shown on screen
      console.warn('SMS delivery failed — returning OTP in dev fallback mode');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'SMS failed — showing code on screen (dev mode)',
        dev_otp: otp,
        sms_failed: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('OTP sent to:', cleanPhone.slice(0, -4) + '****');

    return new Response(JSON.stringify({ success: true, message: 'Verification code sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
