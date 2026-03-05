import { useAvailableNow } from "@/hooks/useAvailableNow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Zap, Clock, CreditCard, Loader2, Power, PowerOff } from "lucide-react";
import { motion } from "framer-motion";

export const AvailableNowCard = () => {
  const {
    isActive, expiresAt, credits, canActivate, reason,
    timeRemaining, cooldownRemaining,
    activate, deactivate, loading, config, planKey,
  } = useAvailableNow();
  const { toast } = useToast();

  if (!config.enabled) {
    return (
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Available Now</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Available Now is not included in your current plan. Upgrade to Standard or higher to boost your visibility.
        </p>
      </section>
    );
  }

  const handleActivate = async () => {
    const result = await activate();
    if (result.error) {
      toast({ title: "Cannot activate", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Available Now activated!", description: `Active for ${config.durationHours} hours.` });
    }
  };

  const handleDeactivate = async () => {
    await deactivate();
    toast({ title: "Available Now deactivated" });
  };

  return (
    <section className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Available Now</h2>
          {isActive && (
            <Badge variant="outline" className="border-success/50 text-success text-xs animate-pulse">
              Active
            </Badge>
          )}
        </div>
        {credits > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CreditCard className="w-3.5 h-3.5" />
            {credits} credit{credits !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {isActive ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Expires in <strong>{timeRemaining}</strong></span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            {expiresAt && (
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{
                  duration: (expiresAt.getTime() - Date.now()) / 1000,
                  ease: "linear",
                }}
              />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeactivate}
            disabled={loading}
            className="gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PowerOff className="w-3.5 h-3.5" />}
            Deactivate
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {cooldownRemaining && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Next activation in <strong>{cooldownRemaining}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleActivate}
              disabled={!canActivate || loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
              Activate Available Now
            </Button>
          </div>
          {reason && !canActivate && (
            <p className="text-xs text-muted-foreground">{reason}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Duration: {config.durationHours}h · Cooldown: {config.cooldownHours}h
            {config.maxPerDay > 0 ? ` · Max ${config.maxPerDay}/day` : " · Unlimited"}
          </p>
        </div>
      )}
    </section>
  );
};
