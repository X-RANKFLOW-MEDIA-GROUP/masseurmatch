import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabase as sharedBrowserClient } from "@/integrations/supabase/client";

// Creating the client at module scope with raw env crashed every client
// bundle that imported this file ("supabaseKey is required"): the service
// role key is never available in the browser. Resolve lazily instead —
// server code gets the service-role client, browser code degrades to the
// shared anon client (writes remain subject to Row Level Security).
let cachedClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cachedClient =
    url && serviceKey
      ? createClient(url, serviceKey)
      : (sharedBrowserClient as unknown as SupabaseClient);
  return cachedClient;
}

export interface KeywordTrendRecord {
  keyword: string;
  score: number;
  date: string;
  week_avg?: number;
  month_avg?: number;
  peak_detected?: boolean;
  week_over_week_change?: number;
}

export interface KeywordInsight {
  keyword: string;
  insight_type: "peak" | "trend" | "alert" | "opportunity";
  description: string;
  action_recommended: string;
  priority: "low" | "medium" | "high" | "critical";
}

// Calculate aggregates for a keyword over time
export async function calculateKeywordAggregates(keyword: string) {
  try {
    const { data } = await getSupabase()
      .from("keyword_trends")
      .select("score, date")
      .eq("keyword", keyword)
      .order("date", { ascending: false })
      .limit(365); // Last year

    if (!data || data.length === 0) return null;

    const scores = data.map((d) => d.score);
    const recentScores = scores.slice(0, 7);
    const monthScores = scores.slice(0, 30);

    const weekAvg =
      recentScores.length > 0
        ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
        : 0;

    const monthAvg =
      monthScores.length > 0
        ? monthScores.reduce((a, b) => a + b, 0) / monthScores.length
        : 0;

    const currentScore = scores[0];
    const isPeak = currentScore > 90 || currentScore === Math.max(...scores);

    // Calculate week-over-week change
    const lastWeekStart = 7;
    const lastWeekEnd = 14;
    const lastWeekScores =
      scores.length > lastWeekEnd
        ? scores.slice(lastWeekStart, lastWeekEnd)
        : [];
    const prevWeekAvg =
      lastWeekScores.length > 0
        ? lastWeekScores.reduce((a, b) => a + b, 0) / lastWeekScores.length
        : weekAvg;
    const weekOverWeekChange =
      prevWeekAvg > 0
        ? ((weekAvg - prevWeekAvg) / prevWeekAvg) * 100
        : 0;

    return {
      keyword,
      currentScore,
      weekAvg: Math.round(weekAvg * 10) / 10,
      monthAvg: Math.round(monthAvg * 10) / 10,
      isPeak,
      weekOverWeekChange: Math.round(weekOverWeekChange * 10) / 10,
      historicalMax: Math.max(...scores),
      historicalMin: Math.min(...scores),
    };
  } catch (err) {
    console.error(`Error calculating aggregates for ${keyword}:`, err);
    return null;
  }
}

// Detect peaks and generate insights
export async function generateKeywordInsights(): Promise<KeywordInsight[]> {
  try {
    // Get all keywords from the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentTrends } = await getSupabase()
      .from("keyword_trends")
      .select("keyword, score, date, week_over_week_change")
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (!recentTrends || recentTrends.length === 0) return [];

    const insights: KeywordInsight[] = [];
    const processedKeywords = new Set<string>();

    for (const trend of recentTrends) {
      if (processedKeywords.has(trend.keyword)) continue;
      processedKeywords.add(trend.keyword);

      // Check for peaks (score > 90)
      if (trend.score > 90) {
        insights.push({
          keyword: trend.keyword,
          insight_type: "peak",
          description: `Peak detected: "${trend.keyword}" reached ${trend.score}/100 on ${trend.date}`,
          action_recommended: `Create blog post: "Best ${trend.keyword} Services Near You" or update existing content`,
          priority: trend.score > 95 ? "critical" : "high",
        });
      }
      // Check for surges (>30% week-over-week)
      else if (trend.week_over_week_change && trend.week_over_week_change > 30) {
        insights.push({
          keyword: trend.keyword,
          insight_type: "trend",
          description: `Emerging trend: "${trend.keyword}" up ${Math.round(trend.week_over_week_change)}% this week`,
          action_recommended: `Write about "${trend.keyword}" - this is a growing market opportunity`,
          priority: "high",
        });
      }
      // Check for new trending keywords (first time > 70)
      else if (trend.score > 70) {
        const allTimeData = await getSupabase()
          .from("keyword_trends")
          .select("score")
          .eq("keyword", trend.keyword)
          .order("score", { ascending: false })
          .limit(100);

        const isNew = allTimeData.data
          ? allTimeData.data.every((d) => d.score < 70)
          : false;

        if (isNew) {
          insights.push({
            keyword: trend.keyword,
            insight_type: "opportunity",
            description: `New opportunity: "${trend.keyword}" is trending for the first time`,
            action_recommended: `Consider creating content around "${trend.keyword}" before competitors`,
            priority: "medium",
          });
        }
      }
    }

    return insights;
  } catch (err) {
    console.error("Error generating insights:", err);
    return [];
  }
}

// Store insights in database
export async function storeInsights(insights: KeywordInsight[]) {
  if (insights.length === 0) return;

  try {
    const { error } = await getSupabase()
      .from("keyword_insights")
      .insert(
        insights.map((insight) => ({
          keyword: insight.keyword,
          insight_type: insight.insight_type,
          description: insight.description,
          action_recommended: insight.action_recommended,
          priority: insight.priority,
          status: "new",
        }))
      );

    if (error) throw error;
    console.log(`✅ Stored ${insights.length} insights`);
  } catch (err) {
    console.error("Error storing insights:", err);
  }
}

// Get top trending keywords
export async function getTopTrendingKeywords(limit = 10) {
  try {
    const { data } = await getSupabase()
      .from("keyword_trends")
      .select("keyword, score, date")
      .order("score", { ascending: false })
      .order("date", { ascending: false })
      .limit(limit * 5);

    if (!data) return [];

    // Group by keyword and get latest score
    const grouped = new Map<
      string,
      { keyword: string; score: number; date: string }
    >();

    for (const record of data) {
      if (!grouped.has(record.keyword)) {
        grouped.set(record.keyword, record);
      }
    }

    return Array.from(grouped.values()).slice(0, limit);
  } catch (err) {
    console.error("Error getting top keywords:", err);
    return [];
  }
}

// Get keywords with peaks
export async function getKeywordsWithPeaks() {
  try {
    const { data } = await getSupabase()
      .from("keyword_trends")
      .select("keyword, score, date, peak_detected")
      .eq("peak_detected", true)
      .order("date", { ascending: false })
      .limit(50);

    return data || [];
  } catch (err) {
    console.error("Error getting peak keywords:", err);
    return [];
  }
}
