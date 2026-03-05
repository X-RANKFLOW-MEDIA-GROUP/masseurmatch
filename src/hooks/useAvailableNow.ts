import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { usePlanLimits } from "@/hooks/usePlanLimits";

interface AvailableNowState {
  isActive: boolean;
  expiresAt: Date | null;
  nextActivationAt: Date | null;
  credits: number;
  canActivate: boolean;
  reason: string | null;
  timeRemaining: string | null;
  cooldownRemaining: string | null;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export const useAvailableNow = () => {
  const { profile, updateProfile, refetch } = useProfile();
  const { availableNowConfig, planKey } = usePlanLimits();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<AvailableNowState>({
    isActive: false,
    expiresAt: null,
    nextActivationAt: null,
    credits: 0,
    canActivate: false,
    reason: null,
    timeRemaining: null,
    cooldownRemaining: null,
  });

  const computeState = useCallback(() => {
    if (!profile) return;

    const now = new Date();
    const isActive = !!(profile as any).available_now &&
      (profile as any).available_now_expires &&
      new Date((profile as any).available_now_expires) > now;

    const expiresAt = isActive ? new Date((profile as any).available_now_expires) : null;
    const credits = (profile as any).available_now_credits || 0;

    // Compute cooldown
    const lastUsed = (profile as any).available_now_last_used
      ? new Date((profile as any).available_now_last_used)
      : null;

    const cooldownMs = availableNowConfig.cooldownHours * 3600000;
    const nextActivationAt = lastUsed ? new Date(lastUsed.getTime() + cooldownMs) : null;
    const inCooldown = nextActivationAt ? nextActivationAt > now : false;

    // Can activate?
    let canActivate = false;
    let reason: string | null = null;

    if (!availableNowConfig.enabled) {
      reason = "Available Now is not included in your plan. Upgrade to Standard or higher.";
    } else if (isActive) {
      reason = "Already active.";
    } else if (inCooldown && credits <= 0) {
      reason = `Cooldown active. Next activation at ${nextActivationAt!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      canActivate = true;
      if (inCooldown && credits > 0) {
        reason = "Using 1 credit to bypass cooldown.";
      }
    }

    const timeRemaining = expiresAt ? formatTimeRemaining(expiresAt.getTime() - now.getTime()) : null;
    const cooldownRemaining = inCooldown && nextActivationAt
      ? formatTimeRemaining(nextActivationAt.getTime() - now.getTime())
      : null;

    setState({ isActive, expiresAt, nextActivationAt, credits, canActivate, reason, timeRemaining, cooldownRemaining });
  }, [profile, availableNowConfig]);

  useEffect(() => {
    computeState();
    const interval = setInterval(computeState, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [computeState]);

  const activate = useCallback(async () => {
    if (!profile || !availableNowConfig.enabled) return { error: "Not available" };

    setLoading(true);
    const now = new Date();
    const lastUsed = (profile as any).available_now_last_used
      ? new Date((profile as any).available_now_last_used)
      : null;
    const cooldownMs = availableNowConfig.cooldownHours * 3600000;
    const inCooldown = lastUsed ? new Date(lastUsed.getTime() + cooldownMs) > now : false;
    const credits = (profile as any).available_now_credits || 0;

    let useCredit = false;
    if (inCooldown) {
      if (credits > 0) {
        useCredit = true;
      } else {
        setLoading(false);
        return { error: "Cooldown active" };
      }
    }

    const expires = new Date(now.getTime() + availableNowConfig.durationHours * 3600000);

    const updates: Record<string, any> = {
      available_now: true,
      available_now_started_at: now.toISOString(),
      available_now_expires: expires.toISOString(),
      available_now_last_used: now.toISOString(),
    };
    if (useCredit) {
      updates.available_now_credits = credits - 1;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    setLoading(false);
    if (error) return { error: error.message };

    await refetch();
    return { error: null };
  }, [profile, availableNowConfig, refetch]);

  const deactivate = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    await supabase
      .from("profiles")
      .update({ available_now: false })
      .eq("id", profile.id);
    setLoading(false);
    await refetch();
  }, [profile, refetch]);

  return { ...state, activate, deactivate, loading, config: availableNowConfig, planKey };
};
