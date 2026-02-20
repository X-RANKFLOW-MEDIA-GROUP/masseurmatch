import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setIsLoading(false);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      toast({ title: "Erro", description: "Falha na autenticação", variant: "destructive" });
      return;
    }

    const { data: roleData } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    
    if (!roleData) {
      await supabase.auth.signOut();
      setIsLoading(false);
      toast({ title: "Acesso negado", description: "Você não tem permissão de administrador.", variant: "destructive" });
      return;
    }

    setIsLoading(false);
    toast({ title: "Bem-vindo, Admin!" });
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-2xl font-black mb-1">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">MasseurMatch Administration</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@masseurmatch.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Entrar"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
