import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface StepVerificationProps {
  onComplete: () => void;
}

export const StepVerification = ({ onComplete }: StepVerificationProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'loading' | 'redirecting' | 'polling'>('idle');

  const startVerification = async () => {
    setStatus('loading');
    try {
      const { data, error } = await supabase.functions.invoke('create-verification-session');
      if (error) throw error;
      
      if (data?.url) {
        setStatus('redirecting');
        // Open Stripe Identity in new tab
        window.open(data.url, '_blank');
        setStatus('polling');
        toast({
          title: "Verificação iniciada",
          description: "Complete a verificação na aba que abriu. Após concluir, clique em 'Verificação concluída'.",
        });
      } else {
        throw new Error('No verification URL returned');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setStatus('idle');
    }
  };

  const checkVerification = async () => {
    setStatus('loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified_identity')
        .eq('user_id', user.id)
        .single();

      if (profile?.is_verified_identity) {
        toast({ title: "Identidade verificada!", description: "Sua identidade foi confirmada com sucesso." });
        onComplete();
      } else {
        toast({ 
          title: "Ainda em processamento", 
          description: "A verificação ainda está sendo processada. Tente novamente em alguns minutos.",
          variant: "destructive" 
        });
        setStatus('polling');
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setStatus('polling');
    }
  };

  const skipForNow = () => {
    toast({ title: "Verificação pendente", description: "Você pode completar a verificação depois no Dashboard." });
    onComplete();
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-2">Verificação de Identidade</h3>
        <p className="text-muted-foreground text-sm">
          Para garantir a segurança da plataforma, precisamos verificar sua identidade 
          com um documento oficial (RG, CNH ou Passaporte).
        </p>
      </div>

      <div className="glass-card p-4 text-left space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Documento com foto</p>
            <p className="text-xs text-muted-foreground">RG, CNH ou Passaporte válido</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Selfie de verificação</p>
            <p className="text-xs text-muted-foreground">Para confirmar que o documento é seu</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Processamento seguro</p>
            <p className="text-xs text-muted-foreground">Dados processados via Stripe, não armazenamos seus documentos</p>
          </div>
        </div>
      </div>

      {status === 'idle' && (
        <Button variant="hero" className="w-full" onClick={startVerification}>
          <Shield className="w-4 h-4 mr-2" />
          Iniciar Verificação
        </Button>
      )}

      {status === 'loading' && (
        <Button variant="hero" className="w-full" disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processando...
        </Button>
      )}

      {(status === 'redirecting' || status === 'polling') && (
        <div className="space-y-3">
          <Button variant="hero" className="w-full" onClick={checkVerification}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verificação concluída
          </Button>
          <Button variant="outline" className="w-full" onClick={startVerification}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir verificação novamente
          </Button>
        </div>
      )}

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={skipForNow}>
        Pular por enquanto
      </Button>
    </div>
  );
};
