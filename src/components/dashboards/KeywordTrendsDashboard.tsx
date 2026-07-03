"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, AlertCircle, Zap, Calendar } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface KeywordTrend {
  keyword: string;
  score: number;
  date: string;
  week_avg?: number;
  month_avg?: number;
  peak_detected?: boolean;
  week_over_week_change?: number;
}

interface KeywordInsight {
  id: string;
  keyword: string;
  insight_type: string;
  description: string;
  action_recommended: string;
  priority: string;
  status: string;
}

export default function KeywordTrendsDashboard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [trends, setTrends] = useState<KeywordTrend[]>([]);
  const [insights, setInsights] = useState<KeywordInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [allKeywords, setAllKeywords] = useState<string[]>([]);
  const [chartData, setChartData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Fetch trends
      const { data: trendsData } = await supabase
        .from("keyword_trends")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      // Fetch insights
      const { data: insightsData } = await supabase
        .from("keyword_insights")
        .select("*")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(compact ? 5 : 10);

      if (trendsData) {
        setTrends(trendsData as KeywordTrend[]);

        // Get unique keywords
        const keywords = [...new Set(trendsData.map((d) => d.keyword))];
        setAllKeywords(keywords);
        setSelectedKeywords(keywords.slice(0, compact ? 3 : 5));

        // Transform for chart
        const grouped = trendsData.reduce(
          (acc: Record<string, Record<string, unknown>>, record) => {
            if (!acc[record.date]) {
              acc[record.date] = { date: record.date };
            }
            acc[record.date][record.keyword] = record.score;
            return acc;
          },
          {}
        );

        setChartData(Object.values(grouped));
      }

      if (insightsData) {
        setInsights(insightsData as KeywordInsight[]);
      }
    } catch (error) {
      console.error("Error fetching keyword trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="h-96 bg-muted/30 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading trends...</p>
          </div>
        </div>
      </div>
    );
  }

  const colors = [
    "#8B1E2D",
    "#FF8A1F",
    "#1E4B8F",
    "#6F8B7A",
    "#C47B5E",
  ];

  const highPriorityInsights = insights.filter((i) => i.priority === "high");
  const maxScore =
    chartData.length > 0
      ? Math.max(
          ...chartData.map((d) =>
            Math.max(
              ...Object.entries(d)
                .filter(([k]) => k !== "date")
                .map(([, v]) => (typeof v === "number" ? v : 0))
            )
          )
        )
      : 100;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Google Trends Monitor</h2>
              <p className="text-xs text-muted-foreground">
                {allKeywords.length} keywords tracked
              </p>
            </div>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className={`grid gap-3 mb-6 ${compact ? "grid-cols-2" : "grid-cols-4"}`}>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Highest Score</p>
            <p className="text-xl font-bold text-accent">{maxScore}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-xl font-bold">
              {(
                chartData.reduce((sum, d) => {
                  const values = Object.values(d).filter(
                    (v) => typeof v === "number"
                  );
                  return (
                    sum +
                    (values.length > 0
                      ? (values.reduce((a, b) => (a as number) + (b as number), 0) as number) /
                        values.length
                      : 0)
                  );
                }, 0) / Math.max(chartData.length, 1)
              ).toFixed(0)}
            </p>
          </div>
          {!compact && (
            <>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Active Keywords</p>
                <p className="text-xl font-bold">{selectedKeywords.length}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Alerts</p>
                <p className="text-xl font-bold text-rose-600">
                  {highPriorityInsights.length}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div className="mb-6 border-t border-border pt-6">
          <ResponsiveContainer width="100%" height={compact ? 250 : 400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#6f6f6f"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#6f6f6f" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {selectedKeywords.map((keyword, idx) => (
                <Line
                  key={keyword}
                  type="monotone"
                  dataKey={keyword}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Keyword Selector */}
        {!compact && (
          <div className="border-t border-border pt-6">
            <p className="text-sm font-medium mb-3">Select Keywords</p>
            <div className="flex flex-wrap gap-2">
              {allKeywords.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedKeywords.includes(keyword)
                      ? "bg-accent text-white"
                      : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Recent Insights</h3>
            {highPriorityInsights.length > 0 && (
              <span className="ml-auto text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                {highPriorityInsights.length} High Priority
              </span>
            )}
          </div>

          <div className="space-y-3">
            {insights.slice(0, compact ? 3 : 5).map((insight) => (
              <div
                key={insight.id}
                className={`rounded-lg border-l-4 border-accent p-3 bg-muted/30 ${
                  insight.priority === "high" ? "border-rose-600 bg-rose-50/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{insight.keyword}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    <p className="text-xs text-accent font-medium mt-2">
                      💡 {insight.action_recommended}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                      insight.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {insight.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
