"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { getCityDemandScores, type CityDemandData } from "@/app/_lib/analytics-aggregation";

export function CityDemandScore() {
  const [cities, setCities] = useState<CityDemandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCityDemandScores().then((data) => {
      setCities(data);
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

  const bestOpportunity = cities.find((c) => c.opportunity.includes("High")) || cities[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
          <Zap className="h-4 w-4 text-green-700" strokeWidth={2} />
        </div>
        City Demand Score
      </h3>

      <div className="space-y-3">
        {cities.map((city) => (
          <div
            key={city.city}
            className="p-3 rounded-lg border border-border/50 bg-muted/30"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{city.city}</h4>
              <span className="text-lg font-bold text-accent">{city.demandScore}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Competition: <span className="font-medium">{Math.round(city.competitionLevel)}/10</span></span>
              <span>Opportunity: <span className="font-medium text-emerald-600">{city.opportunity}</span></span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/60"
                style={{ width: `${Math.min(city.demandScore * 2, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 {bestOpportunity ? `${bestOpportunity.city} shows ${bestOpportunity.opportunity.toLowerCase()}.` : "No data yet."}
        </p>
      </div>
    </div>
  );
}
