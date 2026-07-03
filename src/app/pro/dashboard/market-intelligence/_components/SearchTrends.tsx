"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { getSearchTrends, type SearchTrendData } from "@/app/_lib/analytics-aggregation";

export function SearchTrends() {
  const [trends, setTrends] = useState<SearchTrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSearchTrends(4).then((data) => {
      setTrends(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="h-24 bg-muted/30 animate-pulse rounded-lg" />
      </div>
    );
  }

  const maxSearches = Math.max(...trends.map((t) => t.searches), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <BarChart3 className="h-4 w-4 text-blue-700" strokeWidth={2} />
          </div>
          Search Trends
        </h3>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
          This month
        </span>
      </div>

      <div className="space-y-2">
        {trends.map((trend) => (
          <div key={trend.keyword} className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate capitalize">{trend.keyword}</p>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(trend.searches / maxSearches) * 100}%` }}
                />
              </div>
            </div>
            <div className="ml-3 text-right shrink-0">
              <p className="text-xs font-semibold text-muted-foreground">
                {trend.searches}
              </p>
              <p className="text-xs text-emerald-600">↑ {trend.trend > 0 ? trend.trend : 0}%</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 {trends.length > 0 ? `"${trends[0].keyword}" is your top search term.` : "No search data yet."}
        </p>
      </div>
    </div>
  );
}
