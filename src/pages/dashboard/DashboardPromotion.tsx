import { Megaphone, Star, Zap, Layers, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePlanLimits } from "@/hooks/usePlanLimits";

const promotions = [
  {
    icon: Star,
    title: "Top Placement",
    desc: "Appear in the top positions for your city",
    requiredPlan: "Gold+",
    check: (l: ReturnType<typeof usePlanLimits>) => l.hasTopPlacement,
  },
  {
    icon: Zap,
    title: "Temporary Boost",
    desc: "Increase your visibility for 24h",
    requiredPlan: "Premium+",
    check: (l: ReturnType<typeof usePlanLimits>) => l.hasBoost,
  },
  {
    icon: Layers,
    title: "Multiple Categories",
    desc: "Appear in more than one specialty",
    requiredPlan: "Premium+",
    check: (l: ReturnType<typeof usePlanLimits>) => l.hasMultipleCategories,
  },
  {
    icon: Megaphone,
    title: "Premium Badge",
    desc: "Visual highlight on your profile",
    requiredPlan: "Premium+",
    check: (l: ReturnType<typeof usePlanLimits>) => l.hasPremiumBadge,
  },
];

const DashboardPromotion = () => {
  const limits = usePlanLimits();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promotion</h1>
        <p className="text-sm text-muted-foreground">Visibility tools based on your plan ({limits.planLabel})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promo) => {
          const unlocked = promo.check(limits);
          return (
            <div key={promo.title} className={`glass-card p-6 space-y-3 ${!unlocked ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between">
                <promo.icon className={`w-5 h-5 ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex items-center gap-1.5">
                  {unlocked ? (
                    <Badge className="text-[10px] bg-success/20 text-success border-success/30">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      <Lock className="w-2.5 h-2.5 mr-0.5" /> {promo.requiredPlan}
                    </Badge>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-sm">{promo.title}</h3>
              <p className="text-xs text-muted-foreground">{promo.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link to="/dashboard/subscription">
          <Button variant="outline">
            View Plans <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPromotion;
