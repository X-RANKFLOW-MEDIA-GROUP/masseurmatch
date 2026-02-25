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
        window.open(data.url, '_blank');
        setStatus('polling');
        toast({
          title: "Verification started",
          description: "Complete the verification in the tab that opened. Once done, click 'Verification Complete'.",
        });
      } else {
        throw new Error('No verification URL returned');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        toast({ title: "Identity verified!", description: "Your identity has been confirmed successfully." });
        onComplete();
      } else {
        toast({ 
          title: "Still processing", 
          description: "Verification is still being processed. Try again in a few minutes.",
          variant: "destructive" 
        });
        setStatus('polling');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setStatus('polling');
    }
  };

  const skipForNow = () => {
    toast({ title: "Verification pending", description: "You can complete verification later from your Dashboard." });
    onComplete();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-1">Identity Verification</h3>
          <p className="text-muted-foreground text-sm">
            Verify your identity with an official document. This also confirms your phone number and email.
          </p>
        </div>

        <div className="glass-card p-4 text-left space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Photo ID</p>
              <p className="text-xs text-muted-foreground">Valid ID card, driver's license, or passport</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Verification selfie</p>
              <p className="text-xs text-muted-foreground">To confirm the document belongs to you</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Secure processing</p>
              <p className="text-xs text-muted-foreground">Data processed via Stripe — we don't store your documents</p>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <Button variant="hero" className="w-full" onClick={startVerification}>
            <Shield className="w-4 h-4 mr-2" />
            Start Identity Verification
          </Button>
        )}

        {status === 'loading' && (
          <Button variant="hero" className="w-full" disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </Button>
        )}

        {(status === 'redirecting' || status === 'polling') && (
          <div className="space-y-3">
            <Button variant="hero" className="w-full" onClick={checkVerification}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verification Complete
            </Button>
            <Button variant="outline" className="w-full" onClick={startVerification}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open verification again
            </Button>
          </div>
        )}
      </div>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={skipForNow}>
        Skip for now
      </Button>
    </div>
  );
};
