import { Megaphone, Star, Zap, Layers, ArrowRight, Lock, CheckCircle2, CreditCard, CalendarClock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePlanLimits } from "@/hooks/usePlanLimits";

const hasProOrElitePromotionAccess = (limits: ReturnType<typeof usePlanLimits>) => limits.planKey === "pro" || limits.planKey === "elite";

const promotions = [
  {
    icon: Star,
    title: "Top Placement",
    desc: "Appear in the top positions for your city",
    requiredPlan: "Pro or Elite",
    check: hasProOrElitePromotionAccess,
  },
  {
    icon: Zap,
    title: "Temporary Boost",
    desc: "Increase your visibility for 24h",
    requiredPlan: "Pro or Elite",
    check: hasProOrElitePromotionAccess,
  },
  {
    icon: Layers,
    title: "Multiple Categories",
    desc: "Appear in more than one specialty",
    requiredPlan: "Pro or Elite",
    check: hasProOrElitePromotionAccess,
  },
  {
    icon: Megaphone,
    title: "Verified Badge",
    desc: "Visual highlight on your profile",
    requiredPlan: "Pro or Elite",
    check: hasProOrElitePromotionAccess,
  },
];

const addOns = [
  {
    icon: CalendarClock,
    title: "Masseur of the Day",
    price: "$15/day",
    desc: "Featured daily spotlight for short-term visibility boosts.",
  },
  {
    icon: Megaphone,
    title: "Sponsor Profile",
    price: "$99/month",
    desc: "Static add-on for a more prominent sponsored placement.",
  },
  {
    icon: Layers,
    title: "Extra Travel Schedules",
    price: "$5 each",
    desc: "Available for Standard members who need more travel slots.",
  },
  {
    icon: Globe,
    title: "Homepage Banner",
    price: "$120/month",
    desc: "Premium homepage exposure for brand-heavy campaigns.",
  },
  {
    icon: CreditCard,
    title: "Credits/Cards",
    price: "Secure comms",
    desc: "Secure communication tools are planned as a follow-up add-on flow.",
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

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">Add-ons</h2>
            <p className="text-sm text-muted-foreground">Informational only for now. Individual checkout flows can be added next.</p>
          </div>
          <Badge variant="outline" className="text-[10px]">Coming Next</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addOns.map((addon) => (
            <div key={addon.title} className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <addon.icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">{addon.title}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px]">{addon.price}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{addon.desc}</p>
            </div>
          ))}
        </div>
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
