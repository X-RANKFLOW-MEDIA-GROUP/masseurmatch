import { MapPin } from "lucide-react";

export function PopularZipCodes() {
  const zipCodes = [
    { zip: "75201", city: "Dallas", demand: 850, growth: 24 },
    { zip: "75204", city: "Dallas", demand: 720, growth: 18 },
    { zip: "75214", city: "Dallas", demand: 650, growth: 12 },
    { zip: "75287", city: "Dallas", demand: 480, growth: 8 },
  ];

  const maxDemand = Math.max(...zipCodes.map((z) => z.demand));

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
        {zipCodes.map((zip, idx) => (
          <div key={zip.zip} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  #{idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{zip.zip}</p>
                  <p className="text-xs text-muted-foreground">{zip.city}</p>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold">{zip.demand} searches</p>
              <p className="text-xs text-emerald-600">+{zip.growth}%</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          🎯 Most searches in ZIP 75201. Consider expanding availability there.
        </p>
      </div>
    </div>
  );
}
