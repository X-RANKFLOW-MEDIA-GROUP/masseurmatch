import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ExternalLink, CheckCircle, AlertCircle, Loader2, Phone, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface StepVerificationProps {
  onComplete: () => void;
}

export const StepVerification = ({ onComplete }: StepVerificationProps) => {
  const { toast } = useToast();
  
  // Phone verification state
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Identity verification state
  const [status, setStatus] = useState<'idle' | 'loading' | 'redirecting' | 'polling'>('idle');

  const sendOtp = async () => {
    if (!phoneNumber.trim()) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }
    setPhoneLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-phone-otp', {
        body: { phone: phoneNumber },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      if (data?.dev_otp) {
        setDevOtp(data.dev_otp);
        toast({ title: "SMS failed — Dev mode", description: "The OTP code is shown on screen for testing.", variant: "destructive" });
      } else {
        setDevOtp(null);
        toast({ title: "Code sent!", description: "Check your phone for the 6-digit verification code." });
      }
      setPhoneStep('otp');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Error", description: "Please enter the full 6-digit code", variant: "destructive" });
      return;
    }
    setPhoneLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-phone-otp', {
        body: { phone: phoneNumber, otp: otpCode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      toast({ title: "Phone verified!", description: "Your phone number has been confirmed." });
      setPhoneStep('verified');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setOtpCode('');
    } finally {
      setPhoneLoading(false);
    }
  };

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
      {/* ── PHONE VERIFICATION ── */}
      <div className="space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-1">Phone Verification</h3>
          <p className="text-muted-foreground text-sm">We'll send a 6-digit code to verify your phone number.</p>
        </div>

        {phoneStep === 'input' && (
          <div className="space-y-3">
            <Input
              type="tel"
              placeholder="+1 555 123 4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white/5 border-white/10 text-center text-lg"
            />
            <Button variant="hero" className="w-full" onClick={sendOtp} disabled={phoneLoading}>
              {phoneLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
              {phoneLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        )}

        {phoneStep === 'otp' && (
          <div className="space-y-4">
            {devOtp && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                <p className="text-xs text-yellow-400 font-medium mb-1">⚠️ Dev Fallback — SMS failed</p>
                <p className="text-2xl font-mono font-bold tracking-[0.3em] text-yellow-300">{devOtp}</p>
              </div>
            )}
            <p className="text-sm text-center text-muted-foreground">
              Enter the 6-digit code sent to <strong className="text-foreground">{phoneNumber}</strong>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button variant="hero" className="w-full" onClick={verifyOtp} disabled={phoneLoading || otpCode.length !== 6}>
              {phoneLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              {phoneLoading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => { setPhoneStep('input'); setOtpCode(''); }}>
                Change number
              </Button>
              <Button variant="ghost" size="sm" onClick={sendOtp} disabled={phoneLoading}>
                Resend code
              </Button>
            </div>
          </div>
        )}

        {phoneStep === 'verified' && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">Phone verified</p>
              <p className="text-xs text-muted-foreground">{phoneNumber}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── DIVIDER ── */}
      <div className="border-t border-border" />

      {/* ── IDENTITY VERIFICATION ── */}
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-1">Identity Verification</h3>
          <p className="text-muted-foreground text-sm">
            Verify your identity with an official document (ID card, driver's license, or passport).
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
