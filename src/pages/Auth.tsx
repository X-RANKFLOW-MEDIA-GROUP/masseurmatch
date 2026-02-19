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
import { CheckCircle, Shield, Camera, User } from "lucide-react";

const Auth = () => {
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
