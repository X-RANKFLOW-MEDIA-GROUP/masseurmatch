import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DashboardVerification = () => {
  const { profile, loading, refetch } = useProfile();
  const [startingVerification, setStartingVerification] = useState(false);

  const handleStartVerification = async () => {
    setStartingVerification(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to start verification.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-verification-session", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Verification session created! Complete it in the new tab.");
        await refetch();
      } else {
        throw new Error("Verification URL not received.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(err.message || "Error starting verification.");
    } finally {
      setStartingVerification(false);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  const checks = [
    {
      label: "Identity Verification",
      desc: "Confirmed via official ID document and selfie",
      done: !!profile?.is_verified_identity,
      icon: ShieldCheck,
    },
    {
      label: "Phone Verified",
      desc: "Phone number confirmed",
      done: !!profile?.is_verified_phone,
      icon: CheckCircle2,
    },
    {
      label: "Photos Approved",
      desc: "At least one photo approved by moderation",
      done: !!profile?.is_verified_photos,
      icon: CheckCircle2,
    },
    {
      label: "Profile Text Approved",
      desc: "Bio, specialties, and details reviewed by admin",
      done: !!profile?.is_verified_profile,
      icon: CheckCircle2,
    },
    {
      label: "Profile Complete",
      desc: "Bio, specialties, location, and pricing filled in",
      done: !!profile?.bio && !!profile?.city && (!!profile?.incall_price || !!profile?.outcall_price),
      icon: CheckCircle2,
    },
  ];

  const allDone = checks.every((c) => c.done);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification</h1>
        <p className="text-sm text-muted-foreground">Your verification status and trust checklist</p>
      </div>

      {/* Overall Status */}
      <div className={`glass-card p-6 border-l-4 ${allDone ? "border-l-success" : "border-l-warning"}`}>
        <div className="flex items-center gap-3">
          {allDone ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-warning" />
          )}
          <div>
            <h2 className="font-semibold">{allDone ? "Profile Verified" : "Verification Incomplete"}</h2>
            <p className="text-xs text-muted-foreground">
              {allDone
                ? "Your profile is fully verified and visible in the directory."
                : "Complete all items below to activate your profile in the directory."}
            </p>
          </div>
        </div>
      </div>

      {/* Under review banner */}
      {profile?.status === "pending_approval" && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
          <Loader2 className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="text-sm font-medium">Profile Under Review</p>
            <p className="text-xs text-muted-foreground">Your profile is currently being reviewed by our team. It will go live once all checks pass.</p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${check.done ? "bg-success/10" : "bg-warning/10"}`}>
              {check.done ? (
                <check.icon className="w-5 h-5 text-success" />
              ) : (
                <Clock className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">{check.label}</h3>
              <p className="text-xs text-muted-foreground">{check.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              {check.label === "Identity Verification" && !check.done && (
                <Button
                  size="sm"
                  onClick={handleStartVerification}
                  disabled={startingVerification}
                >
                  {startingVerification ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                  ) : (
                    <><ExternalLink className="w-4 h-4" /> Verify Now</>
                  )}
                </Button>
              )}
              <Badge variant="outline" className={`text-[10px] ${check.done ? "border-success/40 text-success" : "border-warning/40 text-warning"}`}>
                {check.done ? "Complete" : "Pending"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Compliance Notices</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Profiles only go public after identity verification, photo approval, and profile text review</li>
          <li>• Content policy violations result in immediate deactivation</li>
          <li>• Keep your information up to date to avoid suspension</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardVerification;
