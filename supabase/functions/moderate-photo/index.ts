import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid user');

    const { photo_id, image_base64 } = await req.json();
    if (!photo_id || !image_base64) throw new Error('Missing photo_id or image_base64');

    // Use Lovable AI to moderate the image
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI. Analyze the image and determine if it is appropriate for a professional massage therapy directory. 
            
REJECT if the image contains:
- Nudity or sexual content
- Suggestive poses or clothing
- Inappropriate or offensive content
- Violence or graphic content

APPROVE if the image is:
- A professional headshot or portrait
- A massage therapy setting
- Professional certifications or credentials
- A clean, professional environment

Respond with ONLY a JSON object: {"approved": true/false, "reason": "brief explanation"}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${image_base64}` }
              },
              {
                type: 'text',
                text: 'Analyze this image for content moderation.'
              }
            ]
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      throw new Error(`AI moderation failed: ${err}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let moderationResult = { approved: false, reason: 'Could not parse moderation result' };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        moderationResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse AI response:', content);
    }

    // Update photo moderation status
    const newStatus = moderationResult.approved ? 'approved' : 'rejected';
    await supabase.from('profile_photos')
      .update({ 
        moderation_status: newStatus,
        moderation_reason: moderationResult.reason 
      })
      .eq('id', photo_id);

    // Check if all photos are approved to update profile
    if (moderationResult.approved) {
      // Get profile for this photo
      const { data: photo } = await supabase.from('profile_photos')
        .select('profile_id').eq('id', photo_id).single();
      
      if (photo) {
        const { data: pendingPhotos } = await supabase.from('profile_photos')
          .select('id')
          .eq('profile_id', photo.profile_id)
          .neq('moderation_status', 'approved');

        // If no more pending/rejected photos (except current one being approved)
        if (!pendingPhotos || pendingPhotos.length <= 1) {
          const { data: profile } = await supabase.from('profiles')
            .select('is_verified_identity')
            .eq('id', photo.profile_id)
            .single();

          await supabase.from('profiles')
            .update({ 
              is_verified_photos: true,
              is_active: profile?.is_verified_identity === true 
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
