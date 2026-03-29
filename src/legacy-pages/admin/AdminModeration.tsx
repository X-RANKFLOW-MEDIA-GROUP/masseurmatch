import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User, Search, Eye, Bot, Upload, ShieldCheck, Loader2 } from "lucide-react";

const AdminModeration = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; type: string; id: string }>({ open: false, type: "", id: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [manualVerifyDialog, setManualVerifyDialog] = useState<{ open: boolean; userId?: string; name?: string }>({ open: false });
  const [aiScanning, setAiScanning] = useState<Record<string, boolean>>({});

  const loadPhotos = async () => {
    const { data } = await supabase
      .from("profile_photos")
      .select("*, profiles(display_name, full_name, user_id)")
      .eq("moderation_status", "pending");
    setPhotos(data || []);
  };

  const loadVerifications = async () => {
    const { data } = await supabase.from("identity_verifications").select("*").in("status", ["pending", "processing"]);
    if (data && data.length > 0) {
      const userIds = data.map(v => v.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, full_name").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setVerifications(data.map(v => ({ ...v, profile: profileMap.get(v.user_id) || null })));
    } else {
      setVerifications([]);
    }
  };

  const loadPendingProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("status", "pending_approval");
    setPendingProfiles(data || []);
  };

  useEffect(() => { loadPhotos(); loadVerifications(); loadPendingProfiles(); }, []);

  const checkAndActivateProfile = async (userId: string) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    if (!profile) return;
    if (
      profile.is_verified_identity &&
      profile.is_verified_photos &&
      profile.is_verified_profile &&
      profile.is_verified_phone &&
      profile.bio && profile.city &&
      (profile.incall_price || profile.outcall_price)
    ) {
      await supabase.from("profiles").update({ status: "active", is_active: true }).eq("id", profile.id);
      toast({ title: "Profile auto-activated!", description: `${profile.display_name || profile.full_name} is now live.` });
    }
  };

  // Get public URL for a photo
  const getPhotoUrl = (storagePath: string) => {
    if (storagePath.startsWith('http')) return storagePath;
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(storagePath);
    return data?.publicUrl || "";
  };

  // AI scan a photo via SightEngine
  const aiScanPhoto = async (photo: any) => {
    setAiScanning(prev => ({ ...prev, [photo.id]: true }));
    try {
      const imageUrl = getPhotoUrl(photo.storage_path);
      const { data, error } = await supabase.functions.invoke("moderate-photo", {
        body: { photo_id: photo.id, image_url: imageUrl },
      });
      if (error) throw error;
      toast({
        title: data.approved ? "AI: Photo Approved ✓" : "AI: Photo Flagged ✗",
        description: data.reason,
        variant: data.approved ? "default" : "destructive",
      });
      loadPhotos();
    } catch (err: any) {
      toast({ title: "AI scan failed", description: err.message, variant: "destructive" });
    }
    setAiScanning(prev => ({ ...prev, [photo.id]: false }));
  };

  // Batch AI scan all pending photos
  const aiScanAllPhotos = async () => {
    for (const photo of photos) {
      await aiScanPhoto(photo);
    }
  };

  const moderatePhoto = async (id: string, status: "approved" | "rejected", reason?: string) => {
    await supabase.from("profile_photos").update({ moderation_status: status, moderation_reason: reason || null }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert({ admin_user_id: user.id, action: `photo_${status}`, target_type: "photo", target_id: id });
    }
    if (status === "approved") {
      const photo = photos.find(p => p.id === id);
      if (photo?.profiles) {
        const { data: profileData } = await supabase.from("profiles").select("id, user_id").eq("id", photo.profile_id).single();
        if (profileData) {
          await supabase.from("profiles").update({ is_verified_photos: true }).eq("id", profileData.id);
          await checkAndActivateProfile(profileData.user_id);
        }
      }
    }
    toast({ title: `Photo ${status === "approved" ? "approved" : "rejected"}` });
    loadPhotos();
  };

  const moderateVerification = async (id: string, status: "verified" | "failed", reason?: string) => {
    await supabase.from("identity_verifications").update({ status }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert({
        admin_user_id: user.id,
        action: `verification_${status}`,
        target_type: "verification",
        target_id: id,
        details: reason ? { reason } : {},
      });
    }
    if (status === "verified") {
      const verification = verifications.find(v => v.id === id);
      if (verification) {
        await supabase.from("profiles").update({ is_verified_identity: true, is_verified_phone: true }).eq("user_id", verification.user_id);
        await checkAndActivateProfile(verification.user_id);
      }
    }
    toast({ title: `Verification ${status === "verified" ? "approved" : "rejected"}` });
    loadVerifications();
  };

  // Manual identity verification (without Stripe)
  const manualVerifyIdentity = async (userId: string) => {
    const { data: { user: admin } } = await supabase.auth.getUser();
    if (!admin) return;

    // Create a verification record
    await supabase.from("identity_verifications").insert({
      user_id: userId,
      stripe_session_id: `manual_${Date.now()}`,
      status: "verified" as any,
    });

    // Update profile flags
    await supabase.from("profiles").update({
      is_verified_identity: true,
      is_verified_phone: true,
    }).eq("user_id", userId);

    await supabase.from("audit_log").insert({
      admin_user_id: admin.id,
      action: "manual_identity_verification",
      target_type: "user",
      target_id: userId,
    });

    await checkAndActivateProfile(userId);
    toast({ title: "Identity manually verified" });
    setManualVerifyDialog({ open: false });
    loadVerifications();
    loadPendingProfiles();
  };

  const moderateProfile = async (id: string, approved: boolean, reason?: string) => {
    const profile = pendingProfiles.find(p => p.id === id);
    if (!profile) return;
    if (approved) {
      await supabase.from("profiles").update({ is_verified_profile: true }).eq("id", id);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_log").insert({ admin_user_id: user.id, action: "profile_approved", target_type: "profile", target_id: id });
      }
      await checkAndActivateProfile(profile.user_id);
      toast({ title: "Profile text approved" });
    } else {
      await supabase.from("profiles").update({ is_verified_profile: false, status: "rejected" }).eq("id", id);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_log").insert({ admin_user_id: user.id, action: "profile_rejected", target_type: "profile", target_id: id, details: { reason: reason || "Content policy" } });
      }
      toast({ title: "Profile text rejected" });
    }
    loadPendingProfiles();
  };

  const handleReject = () => {
    if (rejectDialog.type === "photo") {
      moderatePhoto(rejectDialog.id, "rejected", rejectReason);
    } else if (rejectDialog.type === "verification") {
      moderateVerification(rejectDialog.id, "failed", rejectReason);
    } else if (rejectDialog.type === "profile") {
      moderateProfile(rejectDialog.id, false, rejectReason);
    }
    setRejectDialog({ open: false, type: "", id: "" });
    setRejectReason("");
  };

  const filteredPhotos = photos.filter(p => {
    if (!searchTerm) return true;
    const name = (p.profiles?.display_name || p.profiles?.full_name || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const filteredProfiles = pendingProfiles.filter(p => {
    if (!searchTerm) return true;
    const name = (p.display_name || p.full_name || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const filteredVerifications = verifications.filter(v => {
    if (!searchTerm) return true;
    const name = (v.profile?.display_name || v.profile?.full_name || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black">Moderation</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Photos ({filteredPhotos.length})</TabsTrigger>
          <TabsTrigger value="profiles">Profiles ({filteredProfiles.length})</TabsTrigger>
          <TabsTrigger value="identity">Identity ({filteredVerifications.length})</TabsTrigger>
        </TabsList>

        {/* PHOTOS TAB */}
        <TabsContent value="photos" className="space-y-4 mt-4">
          {filteredPhotos.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={aiScanAllPhotos}>
                <Bot className="w-4 h-4 mr-1" /> AI Scan All ({filteredPhotos.length})
              </Button>
            </div>
          )}

          {filteredPhotos.length === 0 ? (
            <p className="text-muted-foreground">No pending photos.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhotos.map((p) => (
                <Card key={p.id} className="bg-card border-border overflow-hidden">
                  {/* Photo preview */}
                  <div
                    className="relative aspect-[3/4] bg-muted cursor-pointer group"
                    onClick={() => setPhotoPreview(getPhotoUrl(p.storage_path))}
                  >
                    <img
                      src={getPhotoUrl(p.storage_path)}
                      alt="Pending photo"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {p.moderation_reason && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                        <p className="text-xs text-white truncate">{p.moderation_reason}</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-3 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {p.profiles?.display_name || p.profiles?.full_name || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => aiScanPhoto(p)} disabled={aiScanning[p.id]}>
                        {aiScanning[p.id] ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Bot className="w-3 h-3 mr-1" />}
                        AI Scan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => moderatePhoto(p.id, "approved")}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRejectDialog({ open: true, type: "photo", id: p.id }); setRejectReason(""); }}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PROFILES TAB */}
        <TabsContent value="profiles" className="space-y-3 mt-4">
          {filteredProfiles.length === 0 ? <p className="text-muted-foreground">No pending profiles.</p> : filteredProfiles.map((prof) => (
            <Card key={prof.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {prof.display_name || prof.full_name}
                  </CardTitle>
                  <div className="flex gap-1">
                    {prof.is_verified_identity && <Badge variant="outline" className="text-success border-success/30 text-xs">ID ✓</Badge>}
                    {prof.is_verified_photos && <Badge variant="outline" className="text-success border-success/30 text-xs">Photos ✓</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  {prof.bio && <p><strong>Bio:</strong> {prof.bio}</p>}
                  {prof.specialties?.length > 0 && <p><strong>Specialties:</strong> {prof.specialties.join(", ")}</p>}
                  {prof.city && <p><strong>Location:</strong> {prof.city}, {prof.state}</p>}
                  {(prof.incall_price || prof.outcall_price) && (
                    <p><strong>Pricing:</strong> Incall ${prof.incall_price || "—"} / Outcall ${prof.outcall_price || "—"}</p>
                  )}
                  {prof.phone && <p><strong>Phone:</strong> {prof.phone}</p>}
                  {prof.languages?.length > 0 && <p><strong>Languages:</strong> {prof.languages.join(", ")}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">pending_approval</Badge>
                  {!prof.is_verified_identity && (
                    <Button size="sm" variant="outline" onClick={() => setManualVerifyDialog({ open: true, userId: prof.user_id, name: prof.display_name || prof.full_name })}>
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verify Identity
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => moderateProfile(prof.id, true)}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setRejectDialog({ open: true, type: "profile", id: prof.id }); setRejectReason(""); }}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* IDENTITY TAB */}
        <TabsContent value="identity" className="space-y-3 mt-4">
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant="outline" onClick={() => setManualVerifyDialog({ open: true })}>
              <ShieldCheck className="w-4 h-4 mr-1" /> Manual Verify (No Stripe)
            </Button>
          </div>

          {filteredVerifications.length === 0 ? <p className="text-muted-foreground">No pending verifications.</p> : filteredVerifications.map((v) => (
            <Card key={v.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {v.profile?.display_name || v.profile?.full_name || `User ${v.user_id.slice(0, 8)}`} — Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Status:</strong> {v.status}</p>
                  <p><strong>Session:</strong> {v.stripe_session_id?.startsWith("manual_") ? "Manual verification" : v.stripe_session_id?.slice(0, 20) + "…"}</p>
                  <p><strong>Created:</strong> {new Date(v.created_at).toLocaleString()}</p>
                  {v.stripe_report && (
                    <div className="p-2 bg-muted rounded text-xs">
                      <p><strong>AI Report:</strong> {JSON.stringify(v.stripe_report).slice(0, 200)}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{v.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => moderateVerification(v.id, "verified")}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setRejectDialog({ open: true, type: "verification", id: v.id }); setRejectReason(""); }}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Photo Preview Dialog */}
      <Dialog open={!!photoPreview} onOpenChange={() => setPhotoPreview(null)}>
        <DialogContent className="max-w-3xl p-2">
          {photoPreview && (
            <img src={photoPreview} alt="Full preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(o) => !o && setRejectDialog({ open: false, type: "", id: "" })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rejection Reason</DialogTitle></DialogHeader>
          <Textarea
            placeholder="Provide a reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
            Confirm Rejection
          </Button>
        </DialogContent>
      </Dialog>

      {/* Manual Identity Verification Dialog */}
      <Dialog open={manualVerifyDialog.open} onOpenChange={(o) => !o && setManualVerifyDialog({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Identity Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will mark the user's identity as verified without going through Stripe Identity.
              Use this when you've verified the user's identity through other means (document upload, video call, etc.).
            </p>
            {manualVerifyDialog.name && (
              <p className="text-sm font-medium">User: {manualVerifyDialog.name}</p>
            )}
            {manualVerifyDialog.userId ? (
              <Button onClick={() => manualVerifyIdentity(manualVerifyDialog.userId!)} className="w-full">
                <ShieldCheck className="w-4 h-4 mr-1" /> Confirm Manual Verification
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">Select a user from the Profiles tab or User Management to verify.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
