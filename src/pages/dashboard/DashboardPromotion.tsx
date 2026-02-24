import { Megaphone, Star, Zap, Layers, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const promotions = [
  {
    icon: Star,
    title: "Top Placement",
    desc: "Appear in the top positions for your city",
    plan: "Gold+",
  },
  {
    icon: Zap,
    title: "Temporary Boost",
    desc: "Increase your visibility for 24h",
    plan: "Premium+",
  },
  {
    icon: Layers,
    title: "Multiple Categories",
    desc: "Appear in more than one specialty",
    plan: "Premium+",
  },
  {
    icon: Megaphone,
    title: "Premium Badge",
    desc: "Visual highlight on your profile",
    plan: "Premium+",
  },
];

const DashboardPromotion = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Promotion</h1>
        <p className="text-sm text-muted-foreground">Visibility tools for Pro and Elite plans</p>
      </div>

      <div className="glass-card p-6 border-l-4 border-l-warning">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-warning" />
          <div>
            <h2 className="font-semibold text-sm">Premium Features</h2>
            <p className="text-xs text-muted-foreground">
              Upgrade to Premium or higher to access promotion tools.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promo) => (
          <div key={promo.title} className="glass-card p-6 space-y-3 opacity-60">
            <div className="flex items-center justify-between">
              <promo.icon className="w-5 h-5 text-muted-foreground" />
              <Badge variant="outline" className="text-[10px]">{promo.plan}</Badge>
            </div>
            <h3 className="font-semibold text-sm">{promo.title}</h3>
            <p className="text-xs text-muted-foreground">{promo.desc}</p>
          </div>
        ))}
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