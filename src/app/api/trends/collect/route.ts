import { createServerClient } from "@/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface TrendData {
  keyword: string;
  score: number;
  date: string;
  week_avg?: number;
  month_avg?: number;
  peak_detected?: boolean;
  week_over_week_change?: number;
}

export async function POST(req: NextRequest) {
  try {
    // Verify API key
    const authHeader = req.headers.get("authorization");
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!authHeader || !expectedKey || !authHeader.includes(expectedKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { trends_data } = body as { trends_data: TrendData[] };

    if (!trends_data || !Array.isArray(trends_data)) {
      return NextResponse.json(
        { error: "Invalid payload: trends_data array required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Insert trends data
    const { data: insertedData, error: insertError } = await supabase
      .from("keyword_trends")
      .insert(trends_data)
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to insert trends data", details: insertError },
        { status: 500 }
      );
    }

    // Generate insights for peaks
    const peakKeywords = trends_data.filter((t) => t.peak_detected);

    if (peakKeywords.length > 0) {
      const insights = peakKeywords.map((keyword) => ({
        keyword: keyword.keyword,
        insight_type: "peak" as const,
        description: `Peak detected: "${keyword.keyword}" reached ${keyword.score}/100 on ${keyword.date}`,
        action_recommended: `Create blog post or update content for "${keyword.keyword}"`,
        priority: keyword.score > 95 ? ("critical" as const) : ("high" as const),
        status: "new" as const,
      }));

      await supabase.from("keyword_insights").insert(insights);
    }

    return NextResponse.json({
      success: true,
      inserted: insertedData?.length || 0,
      insights_created: peakKeywords.length,
    });
  } catch (error) {
    console.error("Error in /api/trends/collect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
