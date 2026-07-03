"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getPopularZipCodes, type ZipCodeData } from "@/app/_lib/analytics-aggregation";

export function PopularZipCodes() {
  const [zipCodes, setZipCodes] = useState<ZipCodeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularZipCodes(4).then((data) => {
      setZipCodes(data);
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

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
            <MapPin className="h-4 w-4 text-purple-700" strokeWidth={2} />
          </div>
          Popular ZIP Codes
        </h3>
      </div>

      <div className="space-y-2">
        {zipCodes.map((zip) => (
          <div key={zip.zip_code} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  #{zip.rank}
                </span>
                <div>
                  <p className="text-sm font-medium">{zip.zip_code}</p>
                  <p className="text-xs text-muted-foreground">{zip.city}</p>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold">{zip.demand} searches</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          🎯 {zipCodes.length > 0 ? `Most searches in ZIP ${zipCodes[0].zip_code} (${zipCodes[0].city}).` : "No data yet."}
        </p>
      </div>
    </div>
  );
}
