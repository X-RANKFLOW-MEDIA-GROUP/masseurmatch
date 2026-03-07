import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Knotty 🤙, the friendly AI wellness concierge for MasseurMatch — a directory for male massage therapists.

Your personality:
- Warm, casual, and approachable — like a knowledgeable friend
- Use emojis sparingly but naturally
- Keep responses concise (2-4 sentences max)
- Be inclusive and LGBTQ+ friendly

You can help with:
- Finding the right massage therapist
- Explaining massage types (deep tissue, Swedish, sports, Thai, etc.)
- Tips for first-time clients
- Understanding pricing and what to expect
- Safety and verification information about the platform
- General wellness advice

Guidelines:
- Never make specific medical claims
- Always recommend consulting a healthcare provider for medical concerns
- Be professional but not stiff
- If you don't know something, say so honestly
- Redirect inappropriate questions gracefully`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "I'm a bit overwhelmed right now! 😅 Try again in a moment." }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ reply: "Hmm, I'm having a brain freeze 🧊 Try again in a sec!" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't think of a response. Try asking differently!";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("knotty-chat error:", e);
    return new Response(JSON.stringify({ reply: "Oops, something went wrong on my end! 🤕 Try again." }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
