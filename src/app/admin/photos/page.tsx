"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Photo {
  id: string;
  profileId: string;
  url: string;
  position: number;
  moderationStatus: string | null;
  moderationReason: string | null;
  createdAt: string;
  profile: {
    id: string;
    display_name: string | null;
    full_name: string | null;
    city: string | null;
  } | null;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/photos");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPhotos(json.photos ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load photos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const moderate = async (photoId: string, action: "approve" | "reject") => {
    setActing(photoId);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, action }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, moderationStatus: action === "approve" ? "approved" : "rejected" }
            : p
        )
      );
    } catch {
      // silently fail; user can retry
    } finally {
      setActing(null);
    }
  };

  const pending = photos.filter((p) => !p.moderationStatus || p.moderationStatus === "pending");
  const approved = photos.filter((p) => p.moderationStatus === "approved");
  const rejected = photos.filter((p) => p.moderationStatus === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading photos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Photos" description="Moderate profile photos." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Could not load photos: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Photo Moderation"
        description={`${photos.length} photos total · ${pending.length} pending review`}
        actions={
          <Button variant="outline" size="sm" onClick={fetchPhotos}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          <TabsTrigger value="all">All ({photos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PhotoGrid photos={pending} acting={acting} onModerate={moderate} />
        </TabsContent>
        <TabsContent value="approved">
          <PhotoGrid photos={approved} acting={acting} onModerate={moderate} />
        </TabsContent>
        <TabsContent value="rejected">
          <PhotoGrid photos={rejected} acting={acting} onModerate={moderate} />
        </TabsContent>
        <TabsContent value="all">
          <PhotoGrid photos={photos} acting={acting} onModerate={moderate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PhotoGrid({
  photos,
  acting,
  onModerate,
}: {
  photos: Photo[];
  acting: string | null;
  onModerate: (id: string, action: "approve" | "reject") => void;
}) {
  if (photos.length === 0) {
    return (
      <Card className="border-border bg-white shadow-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-2 h-8 w-8" />
          No photos in this category.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden border-border bg-white shadow-sm">
          <div className="relative aspect-square bg-secondary/20">
            <img
              src={photo.url}
              alt={`Photo ${photo.id}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute right-2 top-2">
              <Badge variant={statusVariant(photo.moderationStatus)}>
                {photo.moderationStatus || "pending"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-3 space-y-2">
            <p className="text-sm font-medium truncate">
              {photo.profile?.display_name || photo.profile?.full_name || "Unknown therapist"}
            </p>
            {photo.profile?.city && (
              <p className="text-xs text-muted-foreground">{photo.profile.city}</p>
            )}
            <p className="font-mono text-[10px] text-muted-foreground truncate">
              {photo.id}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                disabled={acting === photo.id || photo.moderationStatus === "approved"}
                onClick={() => onModerate(photo.id, "approve")}
              >
                {acting === photo.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                disabled={acting === photo.id || photo.moderationStatus === "rejected"}
                onClick={() => onModerate(photo.id, "reject")}
              >
                {acting === photo.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3 text-red-500" />
                )}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function statusVariant(status: string | null) {
  switch (status) {
    case "approved":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}
