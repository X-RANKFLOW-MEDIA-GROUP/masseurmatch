import { TrendingUp, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProfileImprovements() {
  const improvements = [
    {
      title: "Add Hotel Visits",
      reason: "Hotel searches up 35% this month. Could add $2-4K monthly revenue.",
      impact: "High",
      completed: false,
    },
    {
      title: "Add Brazilian Technique",
      reason: "Growing 28% YoY. Specialized therapists get 3.2x more inquiries.",
      impact: "High",
      completed: false,
    },
    {
      title: "Expand to San Antonio",
      reason: "Your services have 9/10 demand-to-competition ratio there.",
      impact: "Medium",
      completed: false,
    },
    {
      title: "Add Business Hours",
      reason: "91% of therapists with complete profiles get 40% more views.",
      impact: "High",
      completed: false,
    },
  ];

  const completed = improvements.filter((i) => i.completed).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <TrendingUp className="h-4 w-4 text-blue-700" strokeWidth={2} />
          </div>
          Profile Improvements
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {completed}/{improvements.length} done
        </span>
      </div>

      <div className="space-y-2">
        {improvements.map((imp, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex items-start gap-3 ${
              imp.completed
                ? "border-emerald-200/50 bg-emerald-50/30"
                : "border-border/50 bg-muted/30"
            }`}
          >
            <div
              className={`flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center mt-0.5 ${
                imp.completed
                  ? "bg-emerald-600 border-emerald-600"
                  : "border-border bg-background"
              }`}
            >
              {imp.completed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{imp.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{imp.reason}</p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    imp.impact === "High"
                      ? "text-rose-700 bg-rose-50"
                      : "text-orange-700 bg-orange-50"
                  }`}
                >
                  {imp.impact} impact
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Link
          href="/pro/dashboard/profile"
          className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1"
        >
          Start editing profile
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
