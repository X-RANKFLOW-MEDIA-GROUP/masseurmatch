import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!firecrawlKey) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { url, profile_id } = await req.json();
    if (!url || !profile_id) throw new Error("Missing url or profile_id");

    // Verify ownership
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("id", profile_id)
      .single();

    if (!profile || profile.user_id !== user.id) throw new Error("Not your profile");

    // Update status to processing
    const { data: importRecord, error: insertErr } = await supabase
      .from("imported_profile_data")
      .insert({ profile_id, source_url: url, status: "processing" })
      .select()
      .single();

    if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);

    // Step 1: Scrape with Firecrawl
    console.log("Scraping:", url);
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!scrapeRes.ok) {
      const errBody = await scrapeRes.text();
      console.error("Firecrawl error:", scrapeRes.status, errBody);

      if (scrapeRes.status === 402) {
        await supabase
          .from("imported_profile_data")
          .update({ status: "failed", error_message: "Scraping service credits exhausted. Please try again later." })
          .eq("id", importRecord.id);
        return new Response(
          JSON.stringify({ error: "Scraping service unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("imported_profile_data")
        .update({ status: "failed", error_message: `Scrape failed: ${scrapeRes.status}` })
        .eq("id", importRecord.id);
      throw new Error(`Scrape failed with status ${scrapeRes.status}`);
    }

    const scrapeData = await scrapeRes.json();
    const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";

    if (!markdown || markdown.length < 50) {
      await supabase
        .from("imported_profile_data")
        .update({ status: "failed", error_message: "Could not extract content from this URL. The page may require login or have no readable content." })
        .eq("id", importRecord.id);
      return new Response(
        JSON.stringify({ error: "No content found at this URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Scraped content length:", markdown.length);

    // Step 2: AI extraction
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a data extraction assistant for a massage therapist directory platform. Extract profile data and reviews from the scraped page content. Be thorough and accurate. If data is not available, use null.`,
          },
          {
            role: "user",
            content: `Extract all reviews, ratings, bio information, and specialties from this massage therapist profile page. Here is the page content:\n\n${markdown.substring(0, 12000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_profile_data",
              description: "Extract structured profile data and reviews from a therapist profile page",
              parameters: {
                type: "object",
                properties: {
                  platform_name: {
                    type: "string",
                    description: "Name of the platform (e.g. Yelp, Google, MassageBook, BodyRubsMap)",
                  },
                  bio: {
                    type: "string",
                    description: "The therapist bio/description text",
                  },
                  specialties: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specialties or services offered",
                  },
                  average_rating: {
                    type: "number",
                    description: "Average rating (1-5 scale)",
                  },
                  total_reviews: {
                    type: "integer",
                    description: "Total number of reviews",
                  },
                  reviews: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        reviewer_name: { type: "string" },
                        rating: { type: "number" },
                        text: { type: "string" },
                        date: { type: "string" },
                      },
                      required: ["text"],
                    },
                    description: "Individual reviews extracted from the page",
                  },
                  summary: {
                    type: "string",
                    description: "A concise professional summary (2-3 sentences) highlighting this therapist's strengths based on all available data",
                  },
                },
                required: ["platform_name", "reviews", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_profile_data" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        await supabase
          .from("imported_profile_data")
          .update({ status: "failed", error_message: "AI rate limit exceeded. Please try again in a few minutes." })
          .eq("id", importRecord.id);
        return new Response(
          JSON.stringify({ error: "AI service is temporarily busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        await supabase
          .from("imported_profile_data")
          .update({ status: "failed", error_message: "AI credits exhausted." })
          .eq("id", importRecord.id);
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiRes.text();
      console.error("AI error:", status, errText);
      await supabase
        .from("imported_profile_data")
        .update({ status: "failed", error_message: `AI extraction failed: ${status}` })
        .eq("id", importRecord.id);
      throw new Error(`AI extraction failed: ${status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      await supabase
        .from("imported_profile_data")
        .update({ status: "failed", error_message: "AI could not extract structured data from this page" })
        .eq("id", importRecord.id);
      throw new Error("AI returned no structured data");
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log("Extracted:", extracted.platform_name, "reviews:", extracted.reviews?.length);

    // Step 3: Save results
    // Update profile data record
    await supabase
      .from("imported_profile_data")
      .update({
        source_platform: extracted.platform_name || "Unknown",
        ai_summary: extracted.summary || null,
        extracted_bio: extracted.bio || null,
        extracted_specialties: extracted.specialties || [],
        extracted_rating_avg: extracted.average_rating || null,
        extracted_review_count: extracted.reviews?.length || 0,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", importRecord.id);

    // Insert individual reviews
    if (extracted.reviews && extracted.reviews.length > 0) {
      const reviewRows = extracted.reviews.map((r: any) => ({
        profile_id,
        source_url: formattedUrl,
        source_platform: extracted.platform_name || "Unknown",
        reviewer_name: r.reviewer_name || null,
        review_text: r.text,
        rating: r.rating || null,
        review_date: r.date || null,
      }));

      const { error: reviewErr } = await supabase
        .from("imported_reviews")
        .insert(reviewRows);

      if (reviewErr) console.error("Review insert error:", reviewErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        platform: extracted.platform_name,
        reviews_count: extracted.reviews?.length || 0,
        summary: extracted.summary,
        import_id: importRecord.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("import-external-profile error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
