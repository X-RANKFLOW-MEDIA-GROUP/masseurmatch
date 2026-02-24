import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const plans = [
  { name: "Free", price: 0, features: ["Basic profile", "1 city", "Up to 3 photos"], current: true },
  { name: "Standard", price: 29, features: ["Full profile", "1 city", "Up to 6 photos", "Standard badge"] },
  { name: "Premium", price: 59, features: ["Everything in Standard", "3 cities", "10 photos", "Premium badge", "Assisted SEO"] },
  { name: "Gold", price: 99, features: ["Everything in Premium", "5 cities", "Top placement", "Advanced analytics"] },
  { name: "Platinum", price: 149, features: ["Everything in Gold", "Unlimited cities", "Permanent boost", "Priority support"] },
];

const DashboardSubscription = () => {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your advertising plan</p>
      </div>

      {/* Current Plan */}
      <div className="glass-card p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Plan</p>
            <h2 className="text-xl font-bold mt-1">Free</h2>
            <p className="text-sm text-muted-foreground mt-1">$0/month</p>
          </div>
          <Badge variant="outline" className="text-xs">Active</Badge>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.filter(p => p.name !== "Free").map((plan) => (
          <div key={plan.name} className={`glass-card p-6 space-y-4 ${plan.name === "Premium" ? "ring-1 ring-primary" : ""}`}>
            {plan.name === "Premium" && <Badge className="text-[10px]">Most Popular</Badge>}
            <div>
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">${plan.price}<span className="text-sm text-muted-foreground font-normal">/month</span></p>
            </div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full text-xs" size="sm">
              Upgrade <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Need help choosing? <Link to="/pricing" className="underline-sweep text-foreground">See full comparison</Link>
        </p>
      </div>
    </div>
  );
};

export default DashboardSubscription;