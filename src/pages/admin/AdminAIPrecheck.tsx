import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bot, Loader2, CheckCircle, XCircle, Image, FileText } from "lucide-react";

const AdminAIPrecheck = () => {
  const { toast } = useToast();
  const [pendingPhotos, setPendingPhotos] = useState<any[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<Array<{ id: string; type: string; name: string; approved: boolean; reason: string }>>([]);

  const loadPending = async () => {
    const [photos, profiles] = await Promise.all([
      supabase.from("profile_photos").select("*, profiles(display_name, full_name)").eq("moderation_status", "pending"),
      supabase.from("profiles").select("id, user_id, display_name, full_name, bio, specialties").eq("status", "pending_approval"),
    ]);
    setPendingPhotos(photos.data || []);
    setPendingProfiles(profiles.data || []);
  };

  useEffect(() => { loadPending(); }, []);

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage.from("profile-photos").getPublicUrl(storagePath);
    return data?.publicUrl || "";
  };

  const runFullScan = async () => {
    setScanning(true);
    setResults([]);
    const newResults: typeof results = [];

    // Scan photos via SightEngine
    for (const photo of pendingPhotos) {
      try {
        const imageUrl = getPhotoUrl(photo.storage_path);
        const { data, error } = await supabase.functions.invoke("moderate-photo", {
          body: { photo_id: photo.id, image_url: imageUrl },
        });
        if (error) throw error;
        newResults.push({
          id: photo.id,
          type: "photo",
          name: photo.profiles?.display_name || photo.profiles?.full_name || "Unknown",
          approved: data.approved,
          reason: data.reason,
        });
      } catch (err: any) {
        newResults.push({
          id: photo.id,
          type: "photo",
          name: photo.profiles?.display_name || photo.profiles?.full_name || "Unknown",
          approved: false,
          reason: `Scan error: ${err.message}`,
        });
      }
    }

    // Scan profile text via moderate-text
    for (const profile of pendingProfiles) {
      const textsToCheck = [
        profile.bio,
        profile.specialties?.join(", "),
      ].filter(Boolean);

      if (textsToCheck.length === 0) {
        newResults.push({
          id: profile.id,
          type: "profile",
          name: profile.display_name || profile.full_name,
          approved: true,
          reason: "No text content to scan",
        });
        continue;
      }

      try {
        let allApproved = true;
        let reasons: string[] = [];

        for (const text of textsToCheck) {
          const { data, error } = await supabase.functions.invoke("moderate-text", {
            body: { profile_id: profile.id, text, field_name: "bio" },
          });
          if (error) throw error;
          if (data && !data.approved) {
            allApproved = false;
            reasons.push(data.reason);
          }
        }

        newResults.push({
          id: profile.id,
          type: "profile",
          name: profile.display_name || profile.full_name,
          approved: allApproved,
          reason: allApproved ? "All text passed content checks" : reasons.join("; "),
        });
      } catch (err: any) {
        newResults.push({
          id: profile.id,
          type: "profile",
          name: profile.display_name || profile.full_name,
          approved: false,
          reason: `Scan error: ${err.message}`,
        });
      }
    }

    setResults(newResults);
    setScanning(false);
    await loadPending();
    toast({ title: "AI scan complete", description: `${newResults.length} items scanned` });
  };

  const approvedCount = results.filter(r => r.approved).length;
  const flaggedCount = results.filter(r => !r.approved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">AI Pre-check</h1>
        <Button onClick={runFullScan} disabled={scanning || (pendingPhotos.length === 0 && pendingProfiles.length === 0)}>
          {scanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
          {scanning ? "Scanning..." : `Scan All (${pendingPhotos.length + pendingProfiles.length})`}
        </Button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <Image className="w-4 h-4" /> Pending Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{pendingPhotos.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-4 h-4" /> Pending Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{pendingProfiles.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Last Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="flex gap-4">
                <span className="text-success font-bold">{approvedCount} ✓</span>
                <span className="text-destructive font-bold">{flaggedCount} ✗</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No scan yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5" /> SightEngine Moderation + Human Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Click "Scan All" to run SightEngine AI moderation on all pending photos and profile text.
            Approved items will be auto-accepted, flagged items stay in the moderation queue for your final review.
          </p>
          <div className="mt-4 p-4 rounded-lg bg-secondary border border-border space-y-2">
            <p className="text-sm font-medium">Status: Active</p>
            <p className="text-xs text-muted-foreground">Photos → <code className="text-xs">moderate-photo</code> (nudity-2.1, offensive, gore, violence, drugs)</p>
            <p className="text-xs text-muted-foreground">Text → <code className="text-xs">moderate-text</code> (nudity, links, personal info)</p>
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Scan Results</h2>
          {results.map((r) => (
            <Card key={`${r.type}-${r.id}`} className={`border ${r.approved ? "border-success/30" : "border-destructive/30"}`}>
              <CardContent className="pt-4 flex items-center gap-3">
                {r.approved ? (
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{r.type}</Badge>
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{r.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAIPrecheck;
