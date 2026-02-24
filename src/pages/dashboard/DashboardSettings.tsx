import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, AlertTriangle, Loader2 } from "lucide-react";

const DashboardSettings = () => {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [deactivating, setDeactivating] = useState(false);

  const handlePauseProfile = async () => {
    const { error } = await updateProfile({ is_active: false });
    toast({
      title: error ? "Error" : "Profile paused",
      description: error?.message || "Your profile will no longer appear in searches.",
      variant: error ? "destructive" : "default",
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" /> Account
        </h2>
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="opacity-60" />
        </div>
        <div>
          <Label>Full Name</Label>
          <Input value={profile?.full_name || ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground mt-1">To change your name, please contact support.</p>
        </div>
      </section>

      {/* Notifications placeholder */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">New profile views email</p>
            <p className="text-xs text-muted-foreground">Receive weekly alerts</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">MasseurMatch news email</p>
            <p className="text-xs text-muted-foreground">Updates and tips</p>
          </div>
          <Switch defaultChecked />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="glass-card p-6 space-y-4 border border-destructive/20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Pause profile</p>
            <p className="text-xs text-muted-foreground">Your profile will be temporarily hidden</p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePauseProfile}>Pause</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Sign out</p>
            <p className="text-xs text-muted-foreground">End your current session</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
        </div>
      </section>
    </div>
  );
};

export default DashboardSettings;