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
        toast.error("Você precisa estar logado para iniciar a verificação.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-verification-session", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Sessão de verificação criada! Complete no Stripe.");
        await refetch();
      } else {
        throw new Error("URL de verificação não recebida.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(err.message || "Erro ao iniciar verificação.");
    } finally {
      setStartingVerification(false);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-muted rounded" />;

  const checks = [
    {
      label: "Verificação de Identidade",
      desc: "Confirmação via documento oficial e selfie",
      done: !!profile?.is_verified_identity,
      icon: ShieldCheck,
    },
    {
      label: "Fotos Moderadas",
      desc: "Pelo menos uma foto aprovada pela moderação automática",
      done: !!profile?.is_verified_photos,
      icon: CheckCircle2,
    },
    {
      label: "Perfil Completo",
      desc: "Bio, especialidades, localização e preço preenchidos",
      done: !!profile?.bio && !!profile?.city && (!!profile?.incall_price || !!profile?.outcall_price),
      icon: CheckCircle2,
    },
  ];

  const allDone = checks.every((c) => c.done);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verificação</h1>
        <p className="text-sm text-muted-foreground">Status da sua verificação e checklist de confiança</p>
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
            <h2 className="font-semibold">{allDone ? "Perfil Verificado" : "Verificação Incompleta"}</h2>
            <p className="text-xs text-muted-foreground">
              {allDone
                ? "Seu perfil está totalmente verificado e visível no diretório."
                : "Complete todos os itens abaixo para ativar seu perfil no diretório."}
            </p>
          </div>
        </div>
      </div>

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
              {check.label === "Verificação de Identidade" && !check.done && (
                <Button
                  size="sm"
                  onClick={handleStartVerification}
                  disabled={startingVerification}
                >
                  {startingVerification ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Iniciando…</>
                  ) : (
                    <><ExternalLink className="w-4 h-4" /> Verificar Agora</>
                  )}
                </Button>
              )}
              <Badge variant="outline" className={`text-[10px] ${check.done ? "border-success/40 text-success" : "border-warning/40 text-warning"}`}>
                {check.done ? "Completo" : "Pendente"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Avisos de Compliance</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Perfis só ficam públicos após verificação de identidade e aprovação de fotos</li>
          <li>• Violações das políticas de conteúdo resultam em desativação imediata</li>
          <li>• Mantenha suas informações atualizadas para evitar suspensão</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardVerification;
