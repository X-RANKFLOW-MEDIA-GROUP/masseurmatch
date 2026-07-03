import { Zap, TrendingUp } from "lucide-react";

export function CityDemandScore() {
  const cities = [
    { name: "Dallas", score: 87, competition: "High", opportunity: "Strong" },
    { name: "Houston", score: 72, competition: "Medium", opportunity: "Moderate" },
    { name: "Austin", score: 65, competition: "Low", opportunity: "High" },
    { name: "San Antonio", score: 58, competition: "Low", opportunity: "Very High" },
  ];

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
            key={city.name}
            className="p-3 rounded-lg border border-border/50 bg-muted/30"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{city.name}</h4>
              <span className="text-lg font-bold text-accent">{city.score}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Competition: <span className="font-medium">{city.competition}</span></span>
              <span>Opportunity: <span className="font-medium text-emerald-600">{city.opportunity}</span></span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/60"
                style={{ width: `${city.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 San Antonio shows highest opportunity with low competition. Consider expansion there.
        </p>
      </div>
    </div>
  );
}
