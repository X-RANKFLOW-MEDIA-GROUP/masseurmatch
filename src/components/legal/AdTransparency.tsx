import { Info } from "lucide-react";

export const AdTransparency = () => (
  <div className="border border-border rounded-lg p-4 bg-secondary/30">
    <div className="flex items-start gap-3">
      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Advertising Notice
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This listing is a paid advertisement. MasseurMatch does not endorse, verify, or guarantee
          any provider listed in this directory. Users are encouraged to exercise their own judgment
          and conduct their own due diligence before contacting any provider.
        </p>
      </div>
    </div>
  </div>
);
