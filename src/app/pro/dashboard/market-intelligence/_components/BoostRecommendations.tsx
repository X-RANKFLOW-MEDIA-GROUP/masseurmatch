import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BoostRecommendations() {
  const recommendations = [
    {
      title: "Thursday Afternoon Boost",
      description: "Traffic increases 34% on Thursdays 3-6 PM. Boost visibility then.",
      impact: "+28 expected views",
      timing: "This Thursday",
    },
    {
      title: "Weekend Featured Placement",
      description: "Friday-Sunday see 45% higher demand. Prime time for promotion.",
      impact: "+156 expected inquiries",
      timing: "Next weekend",
    },
    {
      title: "Hotel Services Promotion",
      description: "Add hotel visits and promote in DFW area for 40% revenue boost.",
      impact: "+$2,400 potential",
      timing: "Start immediately",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
          <Zap className="h-4 w-4 text-yellow-700" strokeWidth={2} />
        </div>
        Boost Recommendations
      </h3>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">{rec.title}</h4>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap ml-2">
                {rec.timing}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
            <p className="text-xs font-semibold text-accent">{rec.impact}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/pro/dashboard/boost"
          className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1"
        >
          View all boost options
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
