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
import { Ban, CreditCard, RotateCcw, Search, Tag, Undo2, Loader2, DollarSign, UserPlus, Edit, KeyRound, Mail, ShieldCheck } from "lucide-react";

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

  const [stripeDialog, setStripeDialog] = useState<{ open: boolean; profile?: any }>({ open: false });
  const [stripeData, setStripeData] = useState<StripeCustomerData | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [couponTab, setCouponTab] = useState("list");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({ name: "", type: "percent" as "percent" | "amount", value: "", duration: "once", duration_months: "3" });
  const [couponLoading, setCouponLoading] = useState(false);

  const [refundDialog, setRefundDialog] = useState<{ open: boolean; payment?: any }>({ open: false });
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("requested_by_customer");

  // Edit profile dialog
  const [editDialog, setEditDialog] = useState<{ open: boolean; profile?: any }>({ open: false });
  const [editForm, setEditForm] = useState({ display_name: "", bio: "", city: "", state: "", phone: "", incall_price: "", outcall_price: "" });

  // Invite user dialog
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "" });
  const [inviteLoading, setInviteLoading] = useState(false);

  // Reset password
  const [resetLoading, setResetLoading] = useState<string | null>(null);

  const load = async () => {
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
    if (search) query = query.or(`full_name.ilike.%${search}%,display_name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`);
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

  const callUserLookup = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-user-lookup", {
      body: { action, ...params },
    });
    if (error) throw new Error(error.message);
    return data;
  };

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
    toast({ title: `User ${newStatus}` });
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
    toast({ title: "User reactivated" });
    load();
  };

  // Edit profile
  const openEditDialog = (profile: any) => {
    setEditForm({
      display_name: profile.display_name || "",
      bio: profile.bio || "",
      city: profile.city || "",
      state: profile.state || "",
      phone: profile.phone || "",
      incall_price: profile.incall_price?.toString() || "",
      outcall_price: profile.outcall_price?.toString() || "",
    });
    setEditDialog({ open: true, profile });
  };

  const saveProfileEdit = async () => {
    if (!editDialog.profile) return;
    setActionLoading(true);
    const updates: any = {
      display_name: editForm.display_name || null,
      bio: editForm.bio || null,
      city: editForm.city || null,
      state: editForm.state || null,
      phone: editForm.phone || null,
      incall_price: editForm.incall_price ? parseFloat(editForm.incall_price) : null,
      outcall_price: editForm.outcall_price ? parseFloat(editForm.outcall_price) : null,
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", editDialog.profile.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (admin) {
        await supabase.from("audit_log").insert({
          admin_user_id: admin.id, action: "admin_edit_profile", target_type: "profile",
          target_id: editDialog.profile.id, details: updates,
        });
      }
      toast({ title: "Profile updated" });
      setEditDialog({ open: false });
      load();
    }
    setActionLoading(false);
  };

  // Reset password
  const resetPassword = async (profile: any) => {
    setResetLoading(profile.id);
    try {
      const result = await callUserLookup("reset_password", {
        user_id: profile.user_id,
        redirect_to: `${window.location.origin}/reset-password`,
      });
      toast({ title: "Password reset email sent", description: `Sent to ${result.email}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setResetLoading(null);
  };

  // Invite user
  const inviteUser = async () => {
    if (!inviteForm.email) return;
    setInviteLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteForm.email, {
        data: { full_name: inviteForm.full_name },
      });
      if (error) throw error;
      toast({ title: "Invitation sent!", description: `Invite sent to ${inviteForm.email}` });
      setInviteDialog(false);
      setInviteForm({ email: "", full_name: "" });
      // Reload after a delay to allow trigger to create profile
      setTimeout(load, 2000);
    } catch (err: any) {
      toast({ title: "Error sending invite", description: err.message, variant: "destructive" });
    }
    setInviteLoading(false);
  };

  // Manual verify identity
  const manualVerifyIdentity = async (profile: any) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return;
    await supabase.from("identity_verifications").insert({
      user_id: profile.user_id,
      stripe_session_id: `manual_${Date.now()}`,
      status: "verified" as any,
    });
    await supabase.from("profiles").update({
      is_verified_identity: true,
      is_verified_phone: true,
    }).eq("id", profile.id);
    await supabase.from("audit_log").insert({
      admin_user_id: admin.id,
      action: "manual_identity_verification",
      target_type: "user",
      target_id: profile.user_id,
    });
    toast({ title: "Identity manually verified" });
    load();
  };

  const openStripePanel = async (profile: any) => {
    setStripeDialog({ open: true, profile });
    setStripeData(null);
    setStripeLoading(true);
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
      const email = userData?.user?.email;
      if (!email) {
        toast({ title: "Email not found", variant: "destructive" });
        setStripeLoading(false);
        return;
      }
      const data = await callStripeAdmin("lookup_customer", { email });
      setStripeData(data);
    } catch (err: any) {
      toast({ title: "Error fetching Stripe data", description: err.message, variant: "destructive" });
    }
    setStripeLoading(false);
  };

  const cancelSubscription = async (subId: string) => {
    setActionLoading(true);
    try {
      await callStripeAdmin("cancel_subscription", { subscription_id: subId });
      toast({ title: "Subscription cancelled at period end" });
      if (stripeDialog.profile) openStripePanel(stripeDialog.profile);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const loadCoupons = async () => {
    setCouponLoading(true);
    try {
      const data = await callStripeAdmin("list_coupons");
      setCoupons(data || []);
    } catch (err: any) {
      toast({ title: "Error loading coupons", description: err.message, variant: "destructive" });
    }
    setCouponLoading(false);
  };

  const createCoupon = async () => {
    setActionLoading(true);
    try {
      const params: Record<string, any> = { name: couponForm.name, duration: couponForm.duration };
      if (couponForm.type === "percent") params.percent_off = parseFloat(couponForm.value);
      else { params.amount_off = Math.round(parseFloat(couponForm.value) * 100); params.currency = "usd"; }
      if (couponForm.duration === "repeating") params.duration_in_months = parseInt(couponForm.duration_months);
      await callStripeAdmin("create_coupon", params);
      toast({ title: "Coupon created!" });
      setCouponForm({ name: "", type: "percent", value: "", duration: "once", duration_months: "3" });
      loadCoupons();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      await callStripeAdmin("delete_coupon", { coupon_id: couponId });
      toast({ title: "Coupon removed" });
      loadCoupons();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const applyCoupon = async (subId: string, couponId: string) => {
    setActionLoading(true);
    try {
      await callStripeAdmin("apply_coupon", { subscription_id: subId, coupon_id: couponId });
      toast({ title: "Coupon applied!" });
      if (stripeDialog.profile) openStripePanel(stripeDialog.profile);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const processRefund = async () => {
    if (!refundDialog.payment) return;
    setActionLoading(true);
    try {
      const params: Record<string, any> = { payment_intent_id: refundDialog.payment.id, reason: refundReason };
      if (refundAmount) params.amount = Math.round(parseFloat(refundAmount) * 100);
      await callStripeAdmin("create_refund", params);
      toast({ title: "Refund processed!" });
      setRefundDialog({ open: false });
      if (stripeDialog.profile) openStripePanel(stripeDialog.profile);
    } catch (err: any) {
      toast({ title: "Refund error", description: err.message, variant: "destructive" });
    }
    setActionLoading(false);
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("en-US");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-black">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setInviteDialog(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Invite User
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={loadCoupons}>
                <Tag className="w-4 h-4 mr-1" /> Coupons
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Manage Coupons</DialogTitle></DialogHeader>
              <Tabs value={couponTab} onValueChange={setCouponTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="list" className="flex-1">Active Coupons</TabsTrigger>
                  <TabsTrigger value="create" className="flex-1">Create Coupon</TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="space-y-2 mt-4">
                  {couponLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                  ) : coupons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No coupons found</p>
                  ) : (
                    coupons.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{c.name || c.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.percent_off ? `${c.percent_off}% off` : c.amount_off ? formatCurrency(c.amount_off, c.currency) + " off" : ""} · {c.duration}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCoupon(c.id)}>Remove</Button>
                      </div>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="create" className="space-y-3 mt-4">
                  <Input placeholder="Coupon name" value={couponForm.name} onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })} />
                  <div className="flex gap-2">
                    <Select value={couponForm.type} onValueChange={(v: any) => setCouponForm({ ...couponForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">% Discount</SelectItem>
                        <SelectItem value="amount">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder={couponForm.type === "percent" ? "e.g. 20" : "e.g. 15.00"} value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} />
                  </div>
                  <Select value={couponForm.duration} onValueChange={(v) => setCouponForm({ ...couponForm, duration: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="repeating">Repeating</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                  {couponForm.duration === "repeating" && (
                    <Input type="number" placeholder="Months" value={couponForm.duration_months} onChange={(e) => setCouponForm({ ...couponForm, duration_months: e.target.value })} />
                  )}
                  <Button onClick={createCoupon} disabled={actionLoading || !couponForm.name || !couponForm.value} className="w-full">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create Coupon
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, city, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {profiles.map((p) => (
          <Card key={p.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{p.display_name || p.full_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {p.city && `${p.city}, ${p.state}`} {p.phone && `· ${p.phone}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={statusColors[p.status] || ""}>{p.status}</Badge>
                  {p.is_verified_identity && <Badge variant="outline" className="text-success border-success/30 text-xs">ID ✓</Badge>}
                  {p.is_verified_photos && <Badge variant="outline" className="text-success border-success/30 text-xs">Photos ✓</Badge>}
                  {p.is_verified_profile && <Badge variant="outline" className="text-success border-success/30 text-xs">Profile ✓</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => openEditDialog(p)}>
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => resetPassword(p)} disabled={resetLoading === p.id}>
                {resetLoading === p.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <KeyRound className="w-4 h-4 mr-1" />}
                Reset Password
              </Button>
              {!p.is_verified_identity && (
                <Button size="sm" variant="outline" onClick={() => manualVerifyIdentity(p)}>
                  <ShieldCheck className="w-4 h-4 mr-1" /> Verify ID
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => openStripePanel(p)}>
                <CreditCard className="w-4 h-4 mr-1" /> Stripe
              </Button>

              {p.status === "active" && (
                <Dialog open={suspendDialog.open && suspendDialog.profileId === p.id} onOpenChange={(open) => setSuspendDialog(open ? { open, profileId: p.id, userId: p.user_id } : { open: false })}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Ban className="w-4 h-4 mr-1" /> Suspend/Ban</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Suspend or Ban User</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Select value={suspendForm.type} onValueChange={(v: any) => setSuspendForm({ ...suspendForm, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suspended">Temporarily suspend</SelectItem>
                          <SelectItem value="banned">Permanently ban</SelectItem>
                        </SelectContent>
                      </Select>
                      {suspendForm.type === "suspended" && (
                        <Select value={suspendForm.days} onValueChange={(v) => setSuspendForm({ ...suspendForm, days: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Select value={suspendForm.reason} onValueChange={(v) => setSuspendForm({ ...suspendForm, reason: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="terms_violation">Terms Violation</SelectItem>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                          <SelectItem value="fake_profile">Fake Profile</SelectItem>
                          <SelectItem value="harassment">Harassment</SelectItem>
                          <SelectItem value="fraud">Fraud</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Additional details..." value={suspendForm.detail} onChange={(e) => setSuspendForm({ ...suspendForm, detail: e.target.value })} />
                      <Button onClick={handleSuspend} variant="destructive" className="w-full">Confirm</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {(p.status === "suspended" || p.status === "banned") && (
                <Button size="sm" variant="outline" onClick={() => reactivate(p)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Reactivate
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(o) => !o && setEditDialog({ open: false })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Profile — {editDialog.profile?.display_name || editDialog.profile?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Display Name</label>
              <Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Bio</label>
              <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">City</label>
                <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">State</label>
                <Input value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Incall Price</label>
                <Input type="number" value={editForm.incall_price} onChange={(e) => setEditForm({ ...editForm, incall_price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Outcall Price</label>
                <Input type="number" value={editForm.outcall_price} onChange={(e) => setEditForm({ ...editForm, outcall_price: e.target.value })} />
              </div>
            </div>
            <Button onClick={saveProfileEdit} disabled={actionLoading} className="w-full">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite New User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send an email invitation. The user will receive a link to set their password and complete their profile.
            </p>
            <div>
              <label className="text-xs text-muted-foreground">Email *</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Full Name</label>
              <Input
                placeholder="John Doe"
                value={inviteForm.full_name}
                onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
              />
            </div>
            <Button onClick={inviteUser} disabled={inviteLoading || !inviteForm.email} className="w-full">
              {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Mail className="w-4 h-4 mr-1" />}
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe User Panel Dialog */}
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
            <p className="text-sm text-muted-foreground text-center py-4">Could not load data.</p>
          ) : !stripeData.customer ? (
            <p className="text-sm text-muted-foreground text-center py-4">No Stripe customer found for this user.</p>
          ) : (
            <Tabs defaultValue="subscriptions">
              <TabsList className="w-full">
                <TabsTrigger value="subscriptions" className="flex-1">Subscriptions</TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="subscriptions" className="space-y-3 mt-4">
                {stripeData.subscriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No subscriptions</p>
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
                          Period until: {formatDate(sub.current_period_end)}
                          {sub.cancel_at_period_end && " · Cancellation scheduled"}
                        </p>
                        <div className="flex gap-2">
                          {sub.status === "active" && !sub.cancel_at_period_end && (
                            <Button size="sm" variant="destructive" disabled={actionLoading} onClick={() => cancelSubscription(sub.id)}>
                              Cancel
                            </Button>
                          )}
                          {sub.status === "active" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={loadCoupons}>
                                  <Tag className="w-3 h-3 mr-1" /> Apply Coupon
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Apply Coupon</DialogTitle></DialogHeader>
                                <div className="space-y-2">
                                  {coupons.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No coupons available. Create one first.</p>
                                  ) : (
                                    coupons.map((c: any) => (
                                      <div key={c.id} className="flex items-center justify-between p-2 border border-border rounded">
                                        <span className="text-sm">{c.name} ({c.percent_off ? `${c.percent_off}%` : formatCurrency(c.amount_off, c.currency)})</span>
                                        <Button size="sm" disabled={actionLoading} onClick={() => applyCoupon(sub.id, c.id)}>Apply</Button>
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

              <TabsContent value="payments" className="space-y-3 mt-4">
                {stripeData.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No payments</p>
                ) : (
                  stripeData.payments.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(pay.amount, pay.currency)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(pay.created)} · {pay.status}</p>
                      </div>
                      {pay.status === "succeeded" && (
                        <Button size="sm" variant="outline" onClick={() => { setRefundDialog({ open: true, payment: pay }); setRefundAmount(""); }}>
                          <Undo2 className="w-3 h-3 mr-1" /> Refund
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

      {/* Refund Dialog */}
      <Dialog open={refundDialog.open} onOpenChange={(open) => !open && setRefundDialog({ open: false })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Refund</DialogTitle></DialogHeader>
          {refundDialog.payment && (
            <div className="space-y-4">
              <p className="text-sm">
                Payment: <span className="font-medium">{formatCurrency(refundDialog.payment.amount, refundDialog.payment.currency)}</span>
              </p>
              <Input
                type="number"
                placeholder="Amount (leave empty for full refund)"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                  <SelectItem value="duplicate">Duplicate charge</SelectItem>
                  <SelectItem value="fraudulent">Fraud</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={processRefund} disabled={actionLoading} variant="destructive" className="w-full">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <DollarSign className="w-4 h-4 mr-1" />}
                Confirm Refund
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
