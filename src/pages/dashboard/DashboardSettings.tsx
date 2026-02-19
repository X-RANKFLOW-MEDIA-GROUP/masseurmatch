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
      title: error ? "Erro" : "Perfil pausado",
      description: error?.message || "Seu perfil não aparecerá mais nas buscas.",
      variant: error ? "destructive" : "default",
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      {/* Account Info */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Settings className="w-4 h-4" /> Conta
        </h2>
        <div>
          <Label>E-mail</Label>
          <Input value={user?.email || ""} disabled className="opacity-60" />
        </div>
        <div>
          <Label>Nome completo</Label>
          <Input value={profile?.full_name || ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground mt-1">Para alterar o nome, entre em contato com o suporte.</p>
        </div>
      </section>

      {/* Notifications placeholder */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notificações</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">E-mail de novas visualizações</p>
            <p className="text-xs text-muted-foreground">Receba alertas semanais</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">E-mail de novidades do MasseurMatch</p>
            <p className="text-xs text-muted-foreground">Atualizações e dicas</p>
          </div>
          <Switch defaultChecked />
        </div>
      </section>

      {/* Danger Zone */}
      <section className="glass-card p-6 space-y-4 border border-destructive/20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Zona de Risco
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Pausar perfil</p>
            <p className="text-xs text-muted-foreground">Seu perfil ficará temporariamente invisível</p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePauseProfile}>Pausar</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Sair da conta</p>
            <p className="text-xs text-muted-foreground">Encerrar sua sessão atual</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
        </div>
      </section>
    </div>
  );
};

export default DashboardSettings;
