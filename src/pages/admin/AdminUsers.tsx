import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Ban, CreditCard, RotateCcw, Search, Tag, Undo2, Loader2, DollarSign } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "text-success border-success/30",
  suspended: "text-warning border-warning/30",
  banned: "text-destructive border-destructive/30",
  pending_approval: "text-muted-foreground border-border",
};

const PRODUCT_NAMES: Record<string, string> = {
  prod_TAdRZYbcTlVEbt: "Extra Travel",
  prod_TAdRo6XDH5sSvL: "Masseur of the Day",
  prod_TAdQqYDbv2JMvx: "ELITE",
  prod_TAdQv6MkhZGNPn: "PRO",
  prod_TAdPT0eL01sJvH: "Standard",
  prod_TAdPGu5D4lWYsi: "FREE",
};

interface StripeCustomerData {
  customer: { id: string; email: string; name: string | null; created: number } | null;
  subscriptions: Array<{
    id: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
    items: Array<{ price_id: string; product_id: string; amount: number; currency: string; interval: string }>;
  }>;
  payments: Array<{ id: string; amount: number; currency: string; status: string; created: number }>;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; profileId?: string; userId?: string }>({ open: false });
  const [suspendForm, setSuspendForm] = useState({ type: "suspended" as "suspended" | "banned", reason: "terms_violation", detail: "", days: "7" });

  // Stripe states
  const [stripeDialog, setStripeDialog] = useState<{ open: boolean; profile?: any }>({ open: false });
  const [stripeData, setStripeData] = useState<StripeCustomerData | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Coupon states
  const [couponTab, setCouponTab] = useState("list");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({ name: "", type: "percent" as "percent" | "amount", value: "", duration: "once", duration_months: "3" });
  const [couponLoading, setCouponLoading] = useState(false);

  // Refund states
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; payment?: any }>({ open: false });
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("requested_by_customer");

  const load = async () => {
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
    if (search) query = query.or(`full_name.ilike.%${search}%,display_name.ilike.%${search}%`);
    const { data } = await query;
    setProfiles(data || []);
  };

  useEffect(() => { load(); }, [search]);

  const callStripeAdmin = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-stripe", {
      body: { action, ...params },
    });
    if (error) throw new Error(error.message);
    return data;
  };

  // --- Suspend/Ban ---
  const handleSuspend = async () => {
    if (!suspendDialog.userId) return;
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return;
    const days = suspendForm.type === "banned" ? null : parseInt(suspendForm.days);
    const endsAt = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
    await supabase.from("user_suspensions").insert({
      user_id: suspendDialog.userId, admin_id: admin.id, type: suspendForm.type,
      reason: suspendForm.reason, reason_detail: suspendForm.detail || null, duration_days: days, ends_at: endsAt,
    });
    const newStatus = suspendForm.type === "banned" ? "banned" : "suspended";
    await supabase.from("profiles").update({ status: newStatus, is_active: false }).eq("id", suspendDialog.profileId);
    await supabase.from("audit_log").insert({
      admin_user_id: admin.id, action: `user_${suspendForm.type}`, target_type: "user", target_id: suspendDialog.userId, details: { reason: suspendForm.reason, days },
    });
    toast({ title: `Usuário ${newStatus}` });
    setSuspendDialog({ open: false });
    load();
  };

  const reactivate = async (profile: any) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return;
    await supabase.from("user_suspensions").update({ is_active: false, revoked_at: new Date().toISOString(), revoked_by: admin.id })
      .eq("user_id", profile.user_id).eq("is_active", true);
    await supabase.from("profiles").update({ status: "active", is_active: true }).eq("id", profile.id);
    await supabase.from("audit_log").insert({
      admin_user_id: admin.id, action: "user_reactivated", target_type: "user", target_id: profile.user_id,
    });
    toast({ title: "Usuário reativado" });
    load();
  };

  // --- Stripe: lookup customer ---
  const openStripePanel = async (profile: any) => {
    setStripeDialog({ open: true, profile });
    setStripeData(null);
    setStripeLoading(true);
    try {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
      const email = userData?.user?.email;
      if (!email) {
        // Fallback: try profile name as search
        toast({ title: "Email não encontrado", variant: "destructive" });
        setStripeLoading(false);
        return;
      }
      const data = await callStripeAdmin("lookup_customer", { email });
      setStripeData(data);
    } catch (err: any) {
      toast({ title: "Erro ao buscar dados Stripe", description: err.message, variant: "destructive" });
    }
    setStripeLoading(false);
  };

  // --- Stripe: cancel subscription ---
  const cancelSubscription = async (subId: string) => {
    setActionLoading(true);
    try {
      await callStripeAdmin("cancel_subscription", { subscription_id: subId });
      toast({ title: "Assinatura cancelada no final do período" });
      if (stripeDialog.profile) openStripePanel(stripeDialog.profile);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  // --- Coupons ---
  const loadCoupons = async () => {
    setCouponLoading(true);
    try {
      const data = await callStripeAdmin("list_coupons");
      setCoupons(data || []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar cupons", description: err.message, variant: "destructive" });
    }
    setCouponLoading(false);
  };

  const createCoupon = async () => {
    setActionLoading(true);
    try {
      const params: Record<string, any> = { name: couponForm.name, duration: couponForm.duration };
      if (couponForm.type === "percent") params.percent_off = parseFloat(couponForm.value);
      else { params.amount_off = Math.round(parseFloat(couponForm.value) * 100); params.currency = "brl"; }
      if (couponForm.duration === "repeating") params.duration_in_months = parseInt(couponForm.duration_months);
      await callStripeAdmin("create_coupon", params);
      toast({ title: "Cupom criado!" });
      setCouponForm({ name: "", type: "percent", value: "", duration: "once", duration_months: "3" });
      loadCoupons();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      await callStripeAdmin("delete_coupon", { coupon_id: couponId });
      toast({ title: "Cupom removido" });
      loadCoupons();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const applyCoupon = async (subId: string, couponId: string) => {
    setActionLoading(true);
    try {
      await callStripeAdmin("apply_coupon", { subscription_id: subId, coupon_id: couponId });
      toast({ title: "Cupom aplicado!" });
      if (stripeDialog.profile) openStripePanel(stripeDialog.profile);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  // --- Refund ---
  const processRefund = async () => {
    if (!refundDialog.payment) return;
    setActionLoading(true);
    try {
      const params: Record<string, any> = { payment_intent_id: refundDialog.payment.id, reason: refundReason };
      if (refundAmount) params.amount = Math.round(parseFloat(refundAmount) * 100);
      await callStripeAdmin("create_refund", params);
      toast({ title: "Reembolso processado!" });
      setRefundDialog({ open: false });
      if (stripeDialog.profile) openStripePanel(stripeDialog.profile);
    } catch (err: any) {
      toast({ title: "Erro no reembolso", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("pt-BR");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">User Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={loadCoupons}>
              <Tag className="w-4 h-4 mr-1" /> Cupons
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Gerenciar Cupons</DialogTitle></DialogHeader>
            <Tabs value={couponTab} onValueChange={setCouponTab}>
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">Cupons Ativos</TabsTrigger>
                <TabsTrigger value="create" className="flex-1">Criar Cupom</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="space-y-2 mt-4">
                {couponLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : coupons.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum cupom encontrado</p>
                ) : (
                  coupons.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{c.name || c.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.percent_off ? `${c.percent_off}% off` : c.amount_off ? formatCurrency(c.amount_off, c.currency) + " off" : ""} · {c.duration}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCoupon(c.id)}>Remover</Button>
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="create" className="space-y-3 mt-4">
                <Input placeholder="Nome do cupom" value={couponForm.name} onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })} />
                <div className="flex gap-2">
                  <Select value={couponForm.type} onValueChange={(v: any) => setCouponForm({ ...couponForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">% Desconto</SelectItem>
                      <SelectItem value="amount">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder={couponForm.type === "percent" ? "Ex: 20" : "Ex: 15.00"} value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} />
                </div>
                <Select value={couponForm.duration} onValueChange={(v) => setCouponForm({ ...couponForm, duration: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Uma vez</SelectItem>
                    <SelectItem value="repeating">Repetido</SelectItem>
                    <SelectItem value="forever">Para sempre</SelectItem>
                  </SelectContent>
                </Select>
                {couponForm.duration === "repeating" && (
                  <Input type="number" placeholder="Meses" value={couponForm.duration_months} onChange={(e) => setCouponForm({ ...couponForm, duration_months: e.target.value })} />
                )}
                <Button onClick={createCoupon} disabled={actionLoading || !couponForm.name || !couponForm.value} className="w-full">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Criar Cupom
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {profiles.map((p) => (
          <Card key={p.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{p.display_name || p.full_name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[p.status] || ""}>{p.status}</Badge>
                  {p.is_verified_identity && <Badge variant="outline" className="text-success border-success/30">ID ✓</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              {/* Stripe button */}
              <Button size="sm" variant="outline" onClick={() => openStripePanel(p)}>
                <CreditCard className="w-4 h-4 mr-1" /> Stripe
              </Button>

              {p.status === "active" && (
                <Dialog open={suspendDialog.open && suspendDialog.profileId === p.id} onOpenChange={(open) => setSuspendDialog(open ? { open, profileId: p.id, userId: p.user_id } : { open: false })}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Ban className="w-4 h-4 mr-1" /> Suspender/Banir</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Suspender ou Banir Usuário</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Select value={suspendForm.type} onValueChange={(v: any) => setSuspendForm({ ...suspendForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suspended">Suspender temporariamente</SelectItem>
                          <SelectItem value="banned">Banir permanentemente</SelectItem>
                        </SelectContent>
                      </Select>
                      {suspendForm.type === "suspended" && (
                        <Select value={suspendForm.days} onValueChange={(v) => setSuspendForm({ ...suspendForm, days: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Select value={suspendForm.reason} onValueChange={(v) => setSuspendForm({ ...suspendForm, reason: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="terms_violation">Violação dos Termos</SelectItem>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="inappropriate_content">Conteúdo Impróprio</SelectItem>
                          <SelectItem value="fake_profile">Perfil Falso</SelectItem>
                          <SelectItem value="harassment">Assédio</SelectItem>
                          <SelectItem value="fraud">Fraude</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Detalhes adicionais..." value={suspendForm.detail} onChange={(e) => setSuspendForm({ ...suspendForm, detail: e.target.value })} />
                      <Button onClick={handleSuspend} variant="destructive" className="w-full">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {(p.status === "suspended" || p.status === "banned") && (
                <Button size="sm" variant="outline" onClick={() => reactivate(p)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reativar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== Stripe User Panel Dialog ===== */}
      <Dialog open={stripeDialog.open} onOpenChange={(open) => !open && setStripeDialog({ open: false })}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Stripe — {stripeDialog.profile?.display_name || stripeDialog.profile?.full_name}
            </DialogTitle>
          </DialogHeader>

          {stripeLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : !stripeData ? (
            <p className="text-sm text-muted-foreground text-center py-4">Não foi possível carregar dados.</p>
          ) : !stripeData.customer ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente Stripe encontrado para este usuário.</p>
          ) : (
            <Tabs defaultValue="subscriptions">
              <TabsList className="w-full">
                <TabsTrigger value="subscriptions" className="flex-1">Assinaturas</TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">Pagamentos</TabsTrigger>
              </TabsList>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-3 mt-4">
                {stripeData.subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem assinaturas</p>
                ) : (
                  stripeData.subscriptions.map((sub) => (
                    <Card key={sub.id} className="border-border">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {sub.items.map((i) => PRODUCT_NAMES[i.product_id as string] || i.product_id).join(", ")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.items.map((i) => `${formatCurrency(i.amount, i.currency)}/${i.interval}`).join(" · ")}
                            </p>
                          </div>
                          <Badge variant="outline" className={sub.status === "active" ? "text-success border-success/30" : "text-muted-foreground"}>
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Período até: {formatDate(sub.current_period_end)}
                          {sub.cancel_at_period_end && " · Cancelamento agendado"}
                        </p>
                        <div className="flex gap-2">
                          {sub.status === "active" && !sub.cancel_at_period_end && (
                            <Button size="sm" variant="destructive" disabled={actionLoading} onClick={() => cancelSubscription(sub.id)}>
                              Cancelar
                            </Button>
                          )}
                          {sub.status === "active" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={loadCoupons}>
                                  <Tag className="w-3 h-3 mr-1" /> Aplicar Cupom
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Aplicar Cupom</DialogTitle></DialogHeader>
                                <div className="space-y-2">
                                  {coupons.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhum cupom disponível. Crie um primeiro.</p>
                                  ) : (
                                    coupons.map((c: any) => (
                                      <div key={c.id} className="flex items-center justify-between p-2 border border-border rounded">
                                        <span className="text-sm">{c.name} ({c.percent_off ? `${c.percent_off}%` : formatCurrency(c.amount_off, c.currency)})</span>
                                        <Button size="sm" disabled={actionLoading} onClick={() => applyCoupon(sub.id, c.id)}>Aplicar</Button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-3 mt-4">
                {stripeData.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem pagamentos</p>
                ) : (
                  stripeData.payments.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(pay.amount, pay.currency)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(pay.created)} · {pay.status}</p>
                      </div>
                      {pay.status === "succeeded" && (
                        <Button size="sm" variant="outline" onClick={() => { setRefundDialog({ open: true, payment: pay }); setRefundAmount(""); }}>
                          <Undo2 className="w-3 h-3 mr-1" /> Reembolsar
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Refund Dialog ===== */}
      <Dialog open={refundDialog.open} onOpenChange={(open) => !open && setRefundDialog({ open: false })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Processar Reembolso</DialogTitle></DialogHeader>
          {refundDialog.payment && (
            <div className="space-y-4">
              <p className="text-sm">
                Pagamento: <span className="font-medium">{formatCurrency(refundDialog.payment.amount, refundDialog.payment.currency)}</span>
              </p>
              <Input
                type="number"
                placeholder={`Valor (deixe vazio para reembolso total)`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Solicitado pelo cliente</SelectItem>
                  <SelectItem value="duplicate">Cobrança duplicada</SelectItem>
                  <SelectItem value="fraudulent">Fraude</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={processRefund} disabled={actionLoading} variant="destructive" className="w-full">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <DollarSign className="w-4 h-4 mr-1" />}
                Confirmar Reembolso
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
