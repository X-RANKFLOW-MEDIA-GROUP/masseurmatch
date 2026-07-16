"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { TrendingUp, MapPin } from "lucide-react";

const DEMAND_RADAR_URL = process.env.NEXT_PUBLIC_DEMAND_RADAR_URL;
const DEMAND_RADAR_KEY = process.env.NEXT_PUBLIC_DEMAND_RADAR_KEY;

interface KeywordTrend {
  id: string;
  keyword: string;
  city: string;
  score: number;
  date: string;
}

const supabase = DEMAND_RADAR_URL && DEMAND_RADAR_KEY
  ? createClient(DEMAND_RADAR_URL, DEMAND_RADAR_KEY)
  : null;

export default function DemandRadarTab() {
  const [data, setData] = useState<KeywordTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Demand Radar credentials not configured");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: trendData, error: err } = await supabase
          .from("keyword_trends")
          .select("*")
          .order("date", { ascending: false })
          .limit(240);

        if (err) throw err;

        const trends = (trendData as KeywordTrend[]) || [];
        setData(trends);

        const uniqueCities = [
          ...new Set(trends.map((d: KeywordTrend) => d.city)),
        ].sort() as string[];
        setCities(uniqueCities);
        setError(null);
      } catch (err) {
        console.error("Error loading Demand Radar data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(
    (d: KeywordTrend) => selectedCity === "all" || d.city === selectedCity
  );

  const groupedByCity = filteredData.reduce(
    (acc: Record<string, KeywordTrend[]>, item: KeywordTrend) => {
      if (!acc[item.city]) {
        acc[item.city] = [];
      }
      acc[item.city].push(item);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-2xl mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-accent" />
            Loading Demand Radar...
          </div>
          <div className="text-muted-foreground text-sm">
            Connecting to Supabase
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-2">Error</div>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          Demand Radar
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
          Real-time demand monitor • {data.length} records
        </p>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium mb-2">City</label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
        >
          <option value="all">All cities ({cities.length})</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedByCity).map(([city, cityData]) => (
          <div
            key={city}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-4 pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-accent flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {city}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                {cityData.length} keywords
              </p>
            </div>

            <div className="space-y-2">
              {(cityData as KeywordTrend[]).slice(0, 8).map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{item.keyword}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(item.date).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="bg-accent/10 text-accent px-3 py-1 rounded text-sm font-bold ml-2 flex-shrink-0">
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-muted-foreground text-xs pt-4 border-t border-border">
        <p>Updated: {new Date().toLocaleString("en-US")}</p>
      </div>
    </div>
  );
}
