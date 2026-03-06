import { CheckCircle2, ArrowRight, Loader2, Crown, Sparkles, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const plans = [
  { key: "free", name: "Free", price: 0, features: ["1 photo", "Bottom-tier search", "1 travel schedule/mo", "No analytics", "\"Basic Listing\" watermark"], isFree: true },
  { key: "standard", name: "Standard", price: 39, features: ["6 photos", "Mid-tier search", "Available Now (60 min)", "3 travel schedules/mo", "Basic analytics (views)", "Newsletter chance"] },
  { key: "pro", name: "Pro", price: 79, features: ["12 photos + video", "Top-tier search", "Available Now (120 min)", "Unlimited travel", "Analytics (views + clicks)", "Homepage rotation", "Weekly specials", "Verified badge"], popular: true },
  { key: "elite", name: "Elite", price: 99, features: ["Everything in Pro", "2 active ads (2 cities)", "Priority support"] },
];

const DashboardSubscription = () => {
  const { subscription, refreshSubscription } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Handle return from Stripe checkout
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Welcome aboard!", description: "Your subscription is now active. Enjoy your 14-day free trial!" });
      refreshSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No charges were made.", variant: "destructive" });
    }
  }, [searchParams, refreshSubscription]);

  const handleCheckout = async (planKey: string) => {
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan_key: planKey },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Checkout error", description: err.message || "Failed to create checkout session", variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Portal error", description: err.message || "Failed to open portal", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlanKey = subscription.plan_key;
  const isSubscribed = subscription.subscribed;

  return (
    <div className="max-w-5xl space-y-6">
      {subscription.config_error && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-accent-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Subscription info is temporarily unavailable. Your current plan details will refresh automatically.
          </p>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your advertising plan</p>
      </div>

      {/* Current Plan */}
      <div className="glass-card p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Plan</p>
            <h2 className="text-xl font-bold mt-1 flex items-center gap-2">
              {subscription.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <Crown className="w-5 h-5" />
                  {subscription.plan_name || "Active Plan"}
                </>
              ) : (
                "Free"
              )}
            </h2>
            {isSubscribed && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subscription.is_trial && (
                  <Badge variant="secondary" className="text-[10px]">
                    Trial until {subscription.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : "N/A"}
                  </Badge>
                )}
                {subscription.has_founder_discount && (
                  <Badge className="text-[10px] bg-success/20 text-success border-success/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Founder 50% OFF
                  </Badge>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {isSubscribed
                ? `Renews ${subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : ""}`
                : "$0/month"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{isSubscribed ? subscription.status === "trialing" ? "Trial" : "Active" : "Free"}</Badge>
            {isSubscribed && (
              <Button variant="outline" size="sm" onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                <span className="ml-1">Manage</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Founder Deal Banner */}
      {!isSubscribed && (
        <div className="glass-card p-4 border border-success/20 bg-success/5">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="font-semibold text-sm">Founder Deal — 50% OFF for 3 months</p>
              <p className="text-xs text-muted-foreground">Limited to the first 50 members. All plans include a 14-day free trial. Card required to prevent fraud.</p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlanKey === plan.key;
          return (
            <div key={plan.key} className={`glass-card p-6 space-y-4 ${plan.popular ? "ring-1 ring-primary" : ""} ${isCurrent ? "border-l-4 border-l-success" : ""}`}>
              <div className="flex items-center gap-2">
                {plan.popular && <Badge className="text-[10px]">Most Popular</Badge>}
                {isCurrent && <Badge variant="secondary" className="text-[10px]">Your Plan</Badge>}
              </div>
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold mt-1">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground font-normal">/month</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">14-day free trial included</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="outline" className="w-full text-xs" size="sm" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full text-xs"
                  size="sm"
                  onClick={() => handleCheckout(plan.key)}
                  disabled={!!checkoutLoading}
                >
                  {checkoutLoading === plan.key ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : null}
                  {isSubscribed ? "Switch Plan" : "Start Free Trial"}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          );
        })}
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