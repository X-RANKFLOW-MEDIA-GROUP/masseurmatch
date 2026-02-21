import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User } from "lucide-react";

const AdminModeration = () => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);

  const loadPhotos = async () => {
    const { data } = await supabase.from("profile_photos").select("*, profiles(display_name, full_name)").eq("moderation_status", "pending");
    setPhotos(data || []);
  };

  const loadVerifications = async () => {
    // Load verifications and then fetch profile names via user_id
    const { data } = await supabase.from("identity_verifications").select("*").eq("status", "pending");
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
    // Check if all verification flags are true for this user
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

  const moderatePhoto = async (id: string, status: "approved" | "rejected", reason?: string) => {
    await supabase.from("profile_photos").update({ moderation_status: status, moderation_reason: reason || null }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert({ admin_user_id: user.id, action: `photo_${status}`, target_type: "photo", target_id: id });
    }

    // If approved, check if all photos for this profile are approved and update flag
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

  const moderateVerification = async (id: string, status: "verified" | "failed") => {
    await supabase.from("identity_verifications").update({ status }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert({ admin_user_id: user.id, action: `verification_${status}`, target_type: "verification", target_id: id });
    }

    if (status === "verified") {
      const verification = verifications.find(v => v.id === id);
      if (verification) {
        await supabase.from("profiles").update({ is_verified_identity: true }).eq("user_id", verification.user_id);
        await checkAndActivateProfile(verification.user_id);
      }
    }

    toast({ title: `Verification ${status === "verified" ? "approved" : "rejected"}` });
    loadVerifications();
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
      await supabase.from("profiles").update({ is_verified_profile: false }).eq("id", id);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_log").insert({ admin_user_id: user.id, action: "profile_rejected", target_type: "profile", target_id: id, details: { reason: reason || "Content policy" } });
      }
      toast({ title: "Profile text rejected" });
    }

    loadPendingProfiles();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Moderation</h1>
      <Tabs defaultValue="photos">
        <TabsList>
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
          <TabsTrigger value="profiles">Profiles ({pendingProfiles.length})</TabsTrigger>
          <TabsTrigger value="identity">Identity ({verifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-3 mt-4">
          {photos.length === 0 ? <p className="text-muted-foreground">No pending photos.</p> : photos.map((p) => (
            <Card key={p.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {p.profiles?.display_name || p.profiles?.full_name || "Unknown"} — Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Badge variant="outline">pending</Badge>
                <Button size="sm" variant="outline" onClick={() => moderatePhoto(p.id, "approved")}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => moderatePhoto(p.id, "rejected", "Content policy violation")}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="profiles" className="space-y-3 mt-4">
          {pendingProfiles.length === 0 ? <p className="text-muted-foreground">No pending profiles.</p> : pendingProfiles.map((prof) => (
            <Card key={prof.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {prof.display_name || prof.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  {prof.bio && <p><strong>Bio:</strong> {prof.bio}</p>}
                  {prof.specialties?.length > 0 && <p><strong>Specialties:</strong> {prof.specialties.join(", ")}</p>}
                  {prof.city && <p><strong>Location:</strong> {prof.city}, {prof.state}</p>}
                  {(prof.incall_price || prof.outcall_price) && (
                    <p><strong>Pricing:</strong> Incall ${prof.incall_price || "—"} / Outcall ${prof.outcall_price || "—"}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">pending_approval</Badge>
                  <Button size="sm" variant="outline" onClick={() => moderateProfile(prof.id, true)}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => moderateProfile(prof.id, false, "Content policy violation")}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="identity" className="space-y-3 mt-4">
          {verifications.length === 0 ? <p className="text-muted-foreground">No pending verifications.</p> : verifications.map((v) => (
            <Card key={v.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {v.profile?.display_name || v.profile?.full_name || `User ${v.user_id.slice(0, 8)}`} — Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Badge variant="outline">pending</Badge>
                <Button size="sm" variant="outline" onClick={() => moderateVerification(v.id, "verified")}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => moderateVerification(v.id, "failed")}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
