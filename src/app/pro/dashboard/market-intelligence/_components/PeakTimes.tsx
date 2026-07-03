import { Clock } from "lucide-react";

export function PeakTimes() {
  const times = [
    { time: "6-9 AM", label: "Early", volume: 320 },
    { time: "9 AM-12 PM", label: "Morning", volume: 580 },
    { time: "12-3 PM", label: "Midday", volume: 450 },
    { time: "3-6 PM", label: "Afternoon", volume: 720 },
    { time: "6-9 PM", label: "Evening", volume: 890 },
    { time: "9 PM+", label: "Night", volume: 280 },
  ];

  const maxVolume = Math.max(...times.map((t) => t.volume));

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
          <div key={t.time} className="flex items-center gap-2">
            <div className="w-20">
              <p className="text-xs font-medium truncate">{t.time}</p>
              <p className="text-[10px] text-muted-foreground">{t.label}</p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(t.volume / maxVolume) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground w-12 text-right">
              {t.volume}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          🕕 Peak demand 6-9 PM. Set "Available Now" during these hours.
        </p>
      </div>
    </div>
  );
}
