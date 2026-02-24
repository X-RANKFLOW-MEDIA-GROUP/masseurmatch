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
import { CheckCircle, Shield, Camera, User, Chrome } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  // Signup wizard state
  const [signupStep, setSignupStep] = useState(0); // 0 = not started, 1 = account, 2 = verification, 3 = profile

  const steps = [
    { label: "Conta", icon: User, description: "Criar conta" },
    { label: "Verificação", icon: Shield, description: "Verificar identidade" },
    { label: "Perfil & Fotos", icon: Camera, description: "Completar perfil" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bem-vindo de volta!" });
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (!ageConfirmed) {
      toast({ title: "Erro", description: "Você precisa confirmar que tem 18 anos ou mais", variant: "destructive" });
      return;
    }
    if (!termsAccepted) {
      toast({ title: "Erro", description: "Você precisa aceitar os Termos de Serviço e Política de Privacidade", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.name);
    setIsLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu email para confirmar a conta." });
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
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSocialLoading(null);
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
            <h2 className="text-2xl font-bold mb-2">Configuração do Perfil</h2>
            <p className="text-muted-foreground">Complete os passos abaixo para ativar seu perfil</p>
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
                toast({ title: "Perfil completo!", description: "Seu perfil está em análise e será ativado após verificação." });
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
            Provider Registration
          </Badge>
          <h2 className="text-3xl font-black mb-2">Welcome</h2>
          <p className="text-muted-foreground">Sign in to manage your listing or create a new one</p>
        </div>

        <Tabs defaultValue="signin" className="glass-card p-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or continue with
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
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
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
                    I confirm that I am <strong className="text-foreground">18 years or older</strong>
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms-accept"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <Label htmlFor="terms-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Provider Account"}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or sign up with
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
          <Link to="/" className="text-sm text-muted-foreground hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
