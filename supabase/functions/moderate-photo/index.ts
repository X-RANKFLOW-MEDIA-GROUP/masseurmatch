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

    const { photo_id, image_url, image_base64 } = await req.json();
    if (!photo_id) throw new Error('Missing photo_id');
    if (!image_url && !image_base64) throw new Error('Missing image_url or image_base64');

    let moderationResult = { approved: false, reason: 'Unknown' };

    if (image_url) {
      // Use SightEngine URL check
      const params = new URLSearchParams({
        url: image_url,
        models: 'nudity-2.1,offensive,gore,tobacco,recreational_drug,medical,violence,self-harm',
        api_user: apiUser,
        api_secret: apiSecret,
      });

      const seResponse = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);
      const seResult = await seResponse.json();

      if (seResult.status !== 'success') {
        throw new Error(`SightEngine error: ${JSON.stringify(seResult)}`);
      }

      moderationResult = evaluatePhotoResult(seResult);
    } else if (image_base64) {
      // Use SightEngine binary upload
      const formData = new FormData();
      const binaryData = Uint8Array.from(atob(image_base64), c => c.charCodeAt(0));
      formData.append('media', new Blob([binaryData], { type: 'image/jpeg' }), 'photo.jpg');
      formData.append('models', 'nudity-2.1,offensive,gore,tobacco,recreational_drug,medical,violence,self-harm');
      formData.append('api_user', apiUser);
      formData.append('api_secret', apiSecret);

      const seResponse = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: formData,
      });
      const seResult = await seResponse.json();

      if (seResult.status !== 'success') {
        throw new Error(`SightEngine error: ${JSON.stringify(seResult)}`);
      }

      moderationResult = evaluatePhotoResult(seResult);
    }

    // Update photo moderation status
    const newStatus = moderationResult.approved ? 'approved' : 'rejected';
    await supabase.from('profile_photos')
      .update({
        moderation_status: newStatus,
        moderation_reason: moderationResult.reason,
      })
      .eq('id', photo_id);

    // Check if all photos are approved to update profile
    if (moderationResult.approved) {
      const { data: photo } = await supabase.from('profile_photos')
        .select('profile_id').eq('id', photo_id).single();

      if (photo) {
        const { data: pendingPhotos } = await supabase.from('profile_photos')
          .select('id')
          .eq('profile_id', photo.profile_id)
          .neq('moderation_status', 'approved');

        if (!pendingPhotos || pendingPhotos.length <= 1) {
          const { data: profileData } = await supabase.from('profiles')
            .select('is_verified_identity')
            .eq('id', photo.profile_id)
            .single();

          await supabase.from('profiles')
            .update({
              is_verified_photos: true,
              is_active: profileData?.is_verified_identity === true,
            })
            .eq('id', photo.profile_id);
        }
      }
    }

    return new Response(JSON.stringify({
      approved: moderationResult.approved,
      reason: moderationResult.reason,
      status: newStatus,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function evaluatePhotoResult(result: any): { approved: boolean; reason: string } {
  const reasons: string[] = [];

  // Nudity check — reject if any explicit nudity score > 0.5
  const nudity = result.nudity;
  if (nudity) {
    if ((nudity.sexual_activity || 0) > 0.5) reasons.push('sexual activity detected');
    if ((nudity.sexual_display || 0) > 0.5) reasons.push('sexual display detected');
    if ((nudity.erotica || 0) > 0.5) reasons.push('erotic content detected');
    if ((nudity.very_suggestive || 0) > 0.5) reasons.push('very suggestive content');
    if ((nudity.mildly_suggestive || 0) > 0.7) reasons.push('suggestive content');
  }

  // Offensive content
  if (result.offensive?.prob > 0.5) reasons.push('offensive content detected');

  // Gore
  if (result.gore?.prob > 0.5) reasons.push('graphic/violent content detected');

  // Violence
  if (result.violence?.prob > 0.5) reasons.push('violence detected');

  // Self-harm
  if (result['self-harm']?.prob > 0.5) reasons.push('self-harm content detected');

  // Drugs & tobacco
  if (result.recreational_drug?.prob > 0.5) reasons.push('drug-related content detected');
  if (result.tobacco?.prob > 0.5) reasons.push('tobacco content detected');

  if (reasons.length > 0) {
    return { approved: false, reason: reasons.join('; ') };
  }

  return { approved: true, reason: 'Image passed all content checks' };
}
