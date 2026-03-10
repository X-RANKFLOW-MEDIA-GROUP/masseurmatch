import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { StepVerification } from "@/components/auth/StepVerification";
import { StepProfile } from "@/components/auth/StepProfile";
import { CheckCircle, Shield, Camera, User, Chrome, Phone, ArrowRight } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  // SMS OTP state
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Signup wizard state
  const [signupStep, setSignupStep] = useState(0);

  const steps = [
    { label: t("auth.stepAccount", "Account"), icon: User, description: t("auth.stepAccountDesc", "Create account") },
    { label: t("auth.stepVerification", "Verification"), icon: Shield, description: t("auth.stepVerificationDesc", "Verify identity") },
    { label: t("auth.stepProfile", "Profile & Photos"), icon: Camera, description: t("auth.stepProfileDesc", "Complete profile") },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);
    if (error) {
      toast({ title: t("auth.error", "Error"), description: error.message, variant: "destructive" });
    } else {
      // If "remember me" is not checked, set a flag so session is cleared on browser close
      if (!rememberMe) {
        sessionStorage.setItem("mm_session_only", "true");
      } else {
        sessionStorage.removeItem("mm_session_only");
      }
      toast({ title: t("auth.welcomeBack", "Welcome back!") });
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password.length < 8) {
      toast({ title: t("auth.error", "Error"), description: "Password must be at least 8 characters long", variant: "destructive" });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: t("auth.error", "Error"), description: t("auth.passwordMismatch", "Passwords do not match"), variant: "destructive" });
      return;
    }
    if (!signupData.name.trim() || signupData.name.trim().length < 2) {
      toast({ title: t("auth.error", "Error"), description: "Please enter your full name (at least 2 characters)", variant: "destructive" });
      return;
    }
    if (!ageConfirmed) {
      toast({ title: t("auth.error", "Error"), description: t("auth.ageRequired", "You must confirm you are 18 years or older"), variant: "destructive" });
      return;
    }
    if (!termsAccepted) {
      toast({ title: t("auth.error", "Error"), description: t("auth.termsRequired", "You must accept the Terms of Service and Privacy Policy"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.name);
    setIsLoading(false);
    if (error) {
      toast({ title: t("auth.error", "Error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("auth.accountCreated", "Account created!"), description: t("auth.checkEmail", "Check your email to confirm your account.") });
      setSignupStep(2);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: t("auth.error", "Error"), description: error.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: t("auth.error", "Error"), description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({ title: t("auth.error", "Error"), description: "Please enter a valid phone number with country code (e.g. +1...)", variant: "destructive" });
      return;
    }
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sms-otp", {
        body: { action: "send", phone: phoneNumber },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOtpSent(true);
      toast({ title: "Code sent!", description: `A verification code has been sent to ${phoneNumber}` });
    } catch (err: any) {
      toast({ title: t("auth.error", "Error"), description: err.message || "Failed to send code", variant: "destructive" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      toast({ title: t("auth.error", "Error"), description: "Please enter the full verification code", variant: "destructive" });
      return;
    }
    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sms-otp", {
        body: { action: "verify", phone: phoneNumber, code: otpCode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.authenticated && data?.token_hash) {
        // Use the magic link token to sign in
        const { error: authError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: "magiclink",
        });
        if (authError) throw authError;
        
        if (!rememberMe) {
          sessionStorage.setItem("mm_session_only", "true");
        }
        toast({ title: t("auth.welcomeBack", "Welcome back!") });
        navigate("/dashboard");
      } else {
        toast({ title: t("auth.error", "Error"), description: data?.error || "No account found with this phone number", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: t("auth.error", "Error"), description: err.message || "Verification failed", variant: "destructive" });
    } finally {
      setOtpLoading(false);
    }
  };

  // If user is logged in and on step 2 or 3, show wizard
  if (user && signupStep >= 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <h1 className="text-3xl font-black gradient-text">MasseurMatch</h1>
            </Link>
            <h2 className="text-2xl font-bold mb-2">{t("auth.profileSetup", "Profile Setup")}</h2>
            <p className="text-muted-foreground">{t("auth.completeSteps", "Complete the steps below to activate your profile")}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  signupStep > idx + 1
                    ? 'bg-primary border-primary text-primary-foreground'
                    : signupStep === idx + 1
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
                }`}>
                  {signupStep > idx + 1 ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${signupStep >= idx + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <Progress value={(signupStep / 3) * 100} className="mb-8 h-1" />

          <div className="glass-card p-8">
            {signupStep === 2 && (
              <StepVerification onComplete={() => setSignupStep(3)} />
            )}
            {signupStep === 3 && (
              <StepProfile onComplete={() => {
                toast({ title: t("auth.profileComplete", "Profile complete!"), description: t("auth.profileReview", "Your profile is under review and will be activated after verification.") });
                navigate("/dashboard");
              }} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-black gradient-text">MasseurMatch</h1>
          </Link>
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            {t("auth.providerBadge", "Provider Registration")}
          </Badge>
          <h2 className="text-3xl font-black mb-2">{t("auth.welcome", "Welcome")}</h2>
          <p className="text-muted-foreground">{t("auth.subtitle", "Sign in to manage your listing or create a new one")}</p>
        </div>

        <Tabs defaultValue="signin" className="glass-card p-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">{t("auth.signIn", "Sign In")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.signUp", "Sign Up")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold mb-2">{t("auth.email", "Email")}</label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold mb-2">{t("auth.password", "Password")}</label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                    {t("auth.rememberMe", "Remember me")}
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t("auth.forgotPassword", "Forgot password?")}
                </Link>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.signingIn", "Signing in...") : t("auth.signIn", "Sign In")}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  {t("auth.orContinueWith", "or continue with")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("google")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "google" ? "..." : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "apple" ? "..." : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Apple
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-semibold mb-2">{t("auth.fullName", "Full Name")}</label>
                <Input
                  id="signup-name"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  autoComplete="name"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-semibold mb-2">{t("auth.email", "Email")}</label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-semibold mb-2">{t("auth.password", "Password")}</label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="bg-white/5 border-white/10"
                />
                {signupData.password.length > 0 && signupData.password.length < 8 && (
                  <p className="text-xs text-destructive mt-1">Password must be at least 8 characters</p>
                )}
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-semibold mb-2">{t("auth.confirmPassword", "Confirm Password")}</label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="age-confirm"
                    checked={ageConfirmed}
                    onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
                  />
                  <Label htmlFor="age-confirm" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    {t("auth.ageConfirm", "I confirm that I am")} <strong className="text-foreground">{t("auth.ageConfirmBold", "18 years or older")}</strong>
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms-accept"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <Label htmlFor="terms-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    {t("auth.agreeToTerms", "I agree to the")}{" "}
                    <Link to="/terms" className="text-primary hover:underline">{t("auth.termsLink", "Terms of Service")}</Link>
                    {" "}{t("auth.and", "and")}{" "}
                    <Link to="/privacy" className="text-primary hover:underline">{t("auth.privacyLink", "Privacy Policy")}</Link>
                  </Label>
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.creatingAccount", "Creating account...") : t("auth.createAccount", "Create Provider Account")}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  {t("auth.orSignUpWith", "or sign up with")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("google")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "google" ? "..." : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={!!socialLoading}
                >
                  {socialLoading === "apple" ? "..." : (
                    <>
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Apple
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← {t("auth.backHome", "Back to Home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
