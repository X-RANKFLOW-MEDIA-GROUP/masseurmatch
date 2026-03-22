"use client";

import Link from "next/link";
import { type ComponentType, useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { postJson, requestJson } from "@/app/_lib/request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatHeightInches,
  formatWeightLb,
  getBodyTypeLabel,
} from "@/lib/physical-profile";

type ModerationQueueItem = {
  id: string;
  profileId: string;
  userId: string;
  targetId: string | null;
  itemType: "text" | "photo";
  source: string;
  fieldName: string | null;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "normal" | "high";
  moderationProvider: string | null;
  moderationReason: string | null;
  snapshot: {
    displayName?: string;
    bio?: string;
    city?: string;
    state?: string | null;
    phone?: string | null;
    specialties?: string[];
    incallPrice?: number | null;
    outcallPrice?: number | null;
    heightInches?: number | null;
    weightLb?: number | null;
    bodyType?: string | null;
    imageUrl?: string | null;
    isPrimary?: boolean;
    sortOrder?: number | null;
    originalFileName?: string | null;
  };
  aiResponse: unknown;
  adminReason: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    displayName: string | null;
    fullName: string | null;
    city: string | null;
    state: string | null;
    status: string | null;
    isActive: boolean | null;
  } | null;
  photo: {
    id: string;
    url: string;
    moderationStatus: string | null;
    moderationReason: string | null;
    isPrimary: boolean;
    sortOrder: number | null;
  } | null;
};

type ModerationResponse = {
  ok: true;
  pendingPhotoCount: number;
  items: ModerationQueueItem[];
};

type TabKey = "pending" | "approved" | "rejected";

const TAB_OPTIONS: Array<{ key: TabKey; label: string }> = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function statusVariant(status: ModerationQueueItem["status"]) {
  if (status === "approved") {
    return "default" as const;
  }

  if (status === "rejected") {
    return "destructive" as const;
  }

  return "secondary" as const;
}

function getQueueLabel(item: ModerationQueueItem) {
  if (item.itemType === "photo") {
    return "Photo Upload";
  }

  if (!item.fieldName) {
    return "Listing Draft";
  }

  if (item.fieldName === "display_name") {
    return "Display Name";
  }

  if (item.fieldName === "bio") {
    return "Bio";
  }

  if (item.fieldName === "specialties") {
    return "Specialties";
  }

  return item.fieldName.split("_").join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not resolved";
  }

  return new Date(value).toLocaleString();
}

function getTherapistName(item: ModerationQueueItem) {
  return item.profile?.displayName || item.profile?.fullName || item.snapshot.displayName || "Unknown therapist";
}

function getLocationLabel(item: ModerationQueueItem) {
  return [item.profile?.city || item.snapshot.city, item.profile?.state || item.snapshot.state]
    .filter(Boolean)
    .join(", ");
}

function getSearchText(item: ModerationQueueItem) {
  return [
    item.id,
    item.profileId,
    item.targetId,
    item.itemType,
    item.source,
    item.fieldName,
    item.status,
    item.moderationReason,
    getTherapistName(item),
    item.snapshot.city,
    item.snapshot.state,
    item.snapshot.bio,
    item.snapshot.specialties?.join(", "),
    item.snapshot.bodyType,
    item.snapshot.originalFileName,
    item.photo?.moderationReason,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function serializeAiResponse(aiResponse: unknown) {
  if (!aiResponse) {
    return null;
  }

  if (typeof aiResponse === "string") {
    return aiResponse;
  }

  try {
    return JSON.stringify(aiResponse, null, 2);
  } catch {
    return "Unable to render AI response.";
  }
}

function AiResponseBlock({ aiResponse }: { aiResponse: unknown }) {
  const serialized = serializeAiResponse(aiResponse);

  if (!serialized) {
    return null;
  }

  return (
    <details className="rounded-2xl border border-border bg-secondary/15 p-4">
      <summary className="cursor-pointer text-sm font-medium text-foreground">
        View AI response
      </summary>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
        {serialized}
      </pre>
    </details>
  );
}

function TextSnapshotBlock({ item }: { item: ModerationQueueItem }) {
  const height = formatHeightInches(item.snapshot.heightInches);
  const weight = formatWeightLb(item.snapshot.weightLb);
  const bodyType = getBodyTypeLabel(item.snapshot.bodyType);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-rose-900">
              {item.moderationProvider || "sightengine"} flagged this draft
            </p>
            <p className="text-xs leading-relaxed text-rose-700">
              {item.moderationReason || "The provider submission triggered automated policy checks."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Display Name
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {item.snapshot.displayName || "Not provided"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            City
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {[item.snapshot.city, item.snapshot.state].filter(Boolean).join(", ") || "Not provided"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Submitted Bio
        </p>
        <div className="rounded-2xl border border-border bg-white p-4 text-sm leading-relaxed text-foreground">
          {item.snapshot.bio || "No bio in snapshot."}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Specialties
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {item.snapshot.specialties?.length ? item.snapshot.specialties.join(", ") : "Not provided"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Incall
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {typeof item.snapshot.incallPrice === "number" ? `$${item.snapshot.incallPrice}` : "Not provided"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Outcall
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {typeof item.snapshot.outcallPrice === "number" ? `$${item.snapshot.outcallPrice}` : "Not provided"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Height
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {height || "Not provided"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Weight
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {weight || "Not provided"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Body Type
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
            {bodyType || "Not provided"}
          </div>
        </div>
      </div>

      <AiResponseBlock aiResponse={item.aiResponse} />
    </div>
  );
}

function PhotoSnapshotBlock({ item }: { item: ModerationQueueItem }) {
  const photoUrl = item.photo?.url || item.snapshot.imageUrl || null;
  const reviewReason = item.adminReason || item.photo?.moderationReason || item.moderationReason;
  const scanMessage =
    item.status === "approved"
      ? "This photo cleared moderation and can remain on the profile."
      : item.status === "rejected"
        ? "This photo was blocked from publication by moderation."
        : reviewReason || "Sightengine flagged this upload for manual review before publication.";

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-3xl border border-border bg-slate-100">
          <div
            className="aspect-[4/5] w-full bg-cover bg-center"
            style={photoUrl ? { backgroundImage: `url("${photoUrl}")` } : undefined}
          >
            {!photoUrl ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Photo preview unavailable
              </div>
            ) : null}
          </div>
        </div>

        {photoUrl ? (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={photoUrl} target="_blank" rel="noreferrer">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Open Original
            </a>
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">
                {item.moderationProvider || "sightengine"} review snapshot
              </p>
              <p className="text-xs leading-relaxed text-amber-700">{scanMessage}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Queue Status
            </p>
            <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
              {item.status}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Photo Status
            </p>
            <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
              {item.photo?.moderationStatus || "Pending sync"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Primary Image
            </p>
            <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
              {item.photo?.isPrimary || item.snapshot.isPrimary ? "Yes" : "No"}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sort Order
            </p>
            <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
              {typeof item.photo?.sortOrder === "number"
                ? item.photo.sortOrder
                : typeof item.snapshot.sortOrder === "number"
                  ? item.snapshot.sortOrder
                  : "Not set"}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              File Name
            </p>
            <div className="rounded-2xl border border-border bg-white p-3 text-sm text-foreground">
              {item.snapshot.originalFileName || "Not captured"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Moderation Reason
          </p>
          <div className="rounded-2xl border border-border bg-white p-4 text-sm leading-relaxed text-foreground">
            {reviewReason || "No moderation reason was recorded for this photo."}
          </div>
        </div>

        <AiResponseBlock aiResponse={item.aiResponse} />
      </div>
    </div>
  );
}

function QueueItemCard({
  item,
  actingId,
  onAction,
}: {
  item: ModerationQueueItem;
  actingId: string | null;
  onAction: (item: ModerationQueueItem, action: "approve" | "reject") => Promise<void>;
}) {
  const isPhoto = item.itemType === "photo";
  const locationLabel = getLocationLabel(item) || "Location not set";

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
              <Badge variant="outline">{getQueueLabel(item)}</Badge>
              <Badge variant="outline">{item.source}</Badge>
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">{getTherapistName(item)}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {item.profileId}
                </span>
                <span className="inline-flex items-center gap-1">
                  {isPhoto ? <ImageIcon className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  {isPhoto ? item.targetId || "Photo ID unavailable" : locationLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Submitted {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {item.status === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void onAction(item, "reject")}
                disabled={actingId === item.id}
              >
                {actingId === item.id ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                )}
                {isPhoto ? "Reject Photo" : "Reject Draft"}
              </Button>
              <Button size="sm" onClick={() => void onAction(item, "approve")} disabled={actingId === item.id}>
                {actingId === item.id ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isPhoto ? "Approve Photo" : "Approve & Publish"}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
              Resolved {formatDate(item.resolvedAt)}
              {item.adminReason ? ` | ${item.adminReason}` : ""}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{isPhoto ? <PhotoSnapshotBlock item={item} /> : <TextSnapshotBlock item={item} />}</CardContent>
    </Card>
  );
}

export default function AdminModerationPage() {
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestJson<ModerationResponse>("/api/admin/moderate");
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load moderation queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      if (item.status !== activeTab) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getSearchText(item).includes(normalizedSearch);
    });
  }, [activeTab, items, search]);

  const counts = useMemo(() => {
    return {
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
      pendingTexts: items.filter((item) => item.status === "pending" && item.itemType === "text").length,
      pendingPhotos: items.filter((item) => item.status === "pending" && item.itemType === "photo").length,
    };
  }, [items]);

  const handleAction = async (item: ModerationQueueItem, action: "approve" | "reject") => {
    setActingId(item.id);

    try {
      await postJson("/api/admin/moderate", {
        itemId: item.id,
        action,
        type: item.itemType,
      });

      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the moderation item.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Moderation Center"
        description="Review flagged listing drafts and photo uploads in one queue before anything sensitive reaches the live provider profile."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void loadItems()} disabled={loading}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/photos">
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                Photo Board ({counts.pendingPhotos})
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={ShieldAlert}
          label="Pending Total"
          value={counts.pending}
          description="Waiting for manual review"
          tone="amber"
        />
        <SummaryCard
          icon={FileText}
          label="Pending Texts"
          value={counts.pendingTexts}
          description="Drafts held from publishing"
          tone="slate"
        />
        <SummaryCard
          icon={ImageIcon}
          label="Pending Photos"
          value={counts.pendingPhotos}
          description="Uploads waiting for approval"
          tone="slate"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Approved"
          value={counts.approved}
          description="Cleared by AI or admin"
          tone="emerald"
        />
        <SummaryCard
          icon={XCircle}
          label="Rejected"
          value={counts.rejected}
          description="Blocked from publication"
          tone="rose"
        />
      </div>

      <Card className="border-border bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Unified Review Feed</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search therapist, photo ID, city, bio..."
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-white text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                {tab.label} ({counts[tab.key]})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
              {error}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-4 text-sm text-muted-foreground">
                No moderation items in this view right now.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <QueueItemCard key={item.id} item={item} actingId={actingId} onAction={handleAction} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description: string;
  tone: "amber" | "emerald" | "rose" | "slate";
}) {
  const tones: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
