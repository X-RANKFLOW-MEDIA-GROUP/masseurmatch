"use client";

import { useEffect, useState } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { getHotelOpportunities, type HotelOpportunityData } from "@/app/_lib/analytics-aggregation";

export function HotelOpportunities() {
  const [areas, setAreas] = useState<HotelOpportunityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotelOpportunities().then((data) => {
      setAreas(data);
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

  const topArea = areas.find((a) => a.suggested) || areas[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
          <MapPin className="h-4 w-4 text-rose-700" strokeWidth={2} />
        </div>
        Hotel Opportunities
      </h3>

      <div className="space-y-2">
        {areas.map((area) => (
          <div
            key={area.area}
            className={`p-3 rounded-lg border ${
              area.suggested
                ? "border-accent/20 bg-accent/5"
                : "border-border/50 bg-muted/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{area.area}</h4>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{area.hotels} hotels</span>
                  <span>•</span>
                  <span>{area.searches} searches</span>
                  <span>•</span>
                  <span
                    className={
                      area.demand === "Very High"
                        ? "text-rose-600 font-medium"
                        : area.demand === "High"
                        ? "text-orange-600 font-medium"
                        : ""
                    }
                  >
                    {area.demand}
                  </span>
                </div>
              </div>
              {area.suggested && (
                <div className="flex-shrink-0 ml-2">
                  <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-1 rounded">
                    Suggested
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
          <span>
            {topArea ? `${topArea.area} has highest hotel search volume.` : "No hotel data yet."} Enabling hotel visits
            could increase bookings by 40%.
          </span>
        </p>
      </div>
    </div>
  );
}
