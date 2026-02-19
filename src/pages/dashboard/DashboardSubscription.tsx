import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const plans = [
  { name: "Free", price: 0, features: ["Perfil básico", "1 cidade", "Até 3 fotos"], current: true },
  { name: "Standard", price: 29, features: ["Perfil completo", "1 cidade", "Até 6 fotos", "Selo Standard"] },
  { name: "Premium", price: 59, features: ["Tudo do Standard", "3 cidades", "10 fotos", "Selo Premium", "SEO assistido"] },
  { name: "Gold", price: 99, features: ["Tudo do Premium", "5 cidades", "Destaque no topo", "Analytics avançado"] },
  { name: "Platinum", price: 149, features: ["Tudo do Gold", "Cidades ilimitadas", "Boost permanente", "Suporte prioritário"] },
];

const DashboardSubscription = () => {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu plano de publicidade</p>
      </div>

      {/* Current Plan */}
      <div className="glass-card p-6 border-l-4 border-l-primary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Plano Atual</p>
            <h2 className="text-xl font-bold mt-1">Free</h2>
            <p className="text-sm text-muted-foreground mt-1">R$ 0/mês</p>
          </div>
          <Badge variant="outline" className="text-xs">Ativo</Badge>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.filter(p => p.name !== "Free").map((plan) => (
          <div key={plan.name} className={`glass-card p-6 space-y-4 ${plan.name === "Premium" ? "ring-1 ring-primary" : ""}`}>
            {plan.name === "Premium" && <Badge className="text-[10px]">Mais Popular</Badge>}
            <div>
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">R$ {plan.price}<span className="text-sm text-muted-foreground font-normal">/mês</span></p>
            </div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full text-xs" size="sm">
              Fazer Upgrade <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Precisa de ajuda para escolher? <Link to="/pricing" className="underline-sweep text-foreground">Veja a comparação completa</Link>
        </p>
      </div>
    </div>
  );
};

export default DashboardSubscription;
