import { TrendingUp, ArrowUp } from "lucide-react";

export function DemandSpikes() {
  const spikes = [
    { day: "Mon", traffic: 420, change: 12 },
    { day: "Tue", traffic: 380, change: -5 },
    { day: "Wed", traffic: 510, change: 34 },
    { day: "Thu", traffic: 490, change: 28 },
    { day: "Fri", traffic: 620, change: 58 },
    { day: "Sat", traffic: 580, change: 45 },
    { day: "Sun", traffic: 380, change: -8 },
  ];

  const maxTraffic = Math.max(...spikes.map((s) => s.traffic));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-700" strokeWidth={2} />
          </div>
          Demand Spikes
        </h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
          +18% this week
        </span>
      </div>

      {/* Mini chart */}
      <div className="flex items-end justify-between h-16 gap-1">
        {spikes.map((spike) => (
          <div key={spike.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-gradient-to-t from-accent to-accent/60 rounded-sm"
              style={{ height: `${(spike.traffic / maxTraffic) * 100}%` }}
            />
            <span className="text-xs text-muted-foreground">{spike.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          📈 Friday is your highest demand day. Consider boosting visibility on Thursday.
        </p>
      </div>
    </div>
  );
}
