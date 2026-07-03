"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getPeakTimes, type PeakTimeData } from "@/app/_lib/analytics-aggregation";

export function PeakTimes() {
  const [times, setTimes] = useState<PeakTimeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPeakTimes().then((data) => {
      setTimes(data);
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

  const maxVolume = Math.max(...times.map((t) => t.views), 1);
  const peakTime = times.reduce((max, t) => (t.views > max.views ? t : max), times[0]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <Clock className="h-4 w-4 text-orange-700" strokeWidth={2} />
          </div>
          Peak Hours
        </h3>
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-2">
        {times.map((t) => (
          <div key={t.timeSlot} className="flex items-center gap-2">
            <div className="w-20">
              <p className="text-xs font-medium truncate">{t.timeSlot}</p>
              <p className="text-[10px] text-muted-foreground">{t.percentage}%</p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(t.views / maxVolume) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground w-12 text-right">
              {t.views}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          🕕 Peak demand {peakTime ? peakTime.timeSlot : "N/A"}. Set "Available Now" during these hours.
        </p>
      </div>
    </div>
  );
}
