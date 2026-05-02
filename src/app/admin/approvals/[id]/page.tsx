"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Loader2,
  FileText,
  MapPin,
  DollarSign,
  Star,
  Upload,
} from "lucide-react";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { requestJson } from "@/app/_lib/request";
import Link from "next/link";

type TherapistProfile = {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  neighborhood_name: string | null;
  bio: string | null;
  specialties: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "changes_requested";
  created_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  is_verified_identity: boolean;
  is_verified_phone: boolean;
  profile_completion: number;
  photo_urls: string[];
  document_urls: string[];
};

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawProfileId = params?.id;
  const profileId = Array.isArray(rawProfileId) ? rawProfileId[0] : rawProfileId ?? "";

  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    requestJson<{ ok: boolean; profile: TherapistProfile }>(`/api/admin/approvals/${profileId}`)
      .then((data) => {
        setProfile(data.profile);
        setAdminNotes(data.profile.admin_notes || "");
      })
      .catch(() => {
        console.error("[v0] Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  async function handleApprove() {
    setActioning(true);
    try {
      await requestJson(`/api/admin/approvals/${profileId}`, {
        method: "POST",
        body: JSON.stringify({ action: "approve", notes: adminNotes }),
      });
      router.push("/admin/approvals?status=pending");
    } catch (err) {
      console.error("[v0] Approval failed", err);
    } finally {
      setActioning(false);
    }
  }

  async function handleReject() {
    setActioning(true);
    try {
      await requestJson(`/api/admin/approvals/${profileId}`, {
        method: "POST",
        body: JSON.stringify({ action: "reject", notes: adminNotes }),
      });
      router.push("/admin/approvals?status=rejected");
    } catch (err) {
      console.error("[v0] Rejection failed", err);
    } finally {
      setActioning(false);
    }
  }

  async function handleRequestChanges() {
    setActioning(true);
    try {
      await requestJson(`/api/admin/approvals/${profileId}`, {
        method: "POST",
        body: JSON.stringify({ action: "changes_requested", notes: adminNotes }),
      });
      router.push("/admin/approvals?status=changes_requested");
    } catch (err) {
      console.error("[v0] Request changes failed", err);
    } finally {
      setActioning(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Loading..."
          description=""
        />
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Profile Not Found"
          description=""
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/approvals"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Approvals
        </Link>
      </div>

      <AdminPageHeader
        title={profile.display_name || profile.full_name}
        description={`${profile.email} • ${profile.city || "No city"} • Status: ${profile.status}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification Status */}
          <div className="border border-border bg-white p-6 rounded-lg space-y-4">
            <h2 className="font-semibold text-foreground">Verification Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${profile.is_verified_identity ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {profile.is_verified_identity ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                  )}
                  <span className="font-semibold text-sm">{profile.is_verified_identity ? "ID Verified" : "ID Not Verified"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Stripe Identity check</p>
              </div>
              <div className={`p-4 rounded-lg border ${profile.is_verified_phone ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {profile.is_verified_phone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className="font-semibold text-sm">{profile.is_verified_phone ? "Phone Verified" : "Phone Not Verified"}</span>
                </div>
                <p className="text-xs text-muted-foreground">Optional field</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="border border-border bg-white p-6 rounded-lg space-y-4">
            <h2 className="font-semibold text-foreground">Profile Information</h2>
            
            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                <p className="text-sm text-foreground">{profile.bio}</p>
              </div>
            )}

            {profile.specialties && profile.specialties.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((spec) => (
                    <span key={spec} className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              {profile.incall_price !== null && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">In-Call Rate</h3>
                  <p className="text-sm font-semibold text-foreground">${profile.incall_price}/hr</p>
                </div>
              )}
              {profile.outcall_price !== null && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Out-Call Rate</h3>
                  <p className="text-sm font-semibold text-foreground">${profile.outcall_price}/hr</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {profile.photo_urls && profile.photo_urls.length > 0 && (
            <div className="border border-border bg-white p-6 rounded-lg space-y-4">
              <h2 className="font-semibold text-foreground">Photos ({profile.photo_urls.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {profile.photo_urls.map((url, idx) => (
                  <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Decision */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="border border-border bg-white p-6 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Completion</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-900 h-full transition-all"
                  style={{ width: `${profile.profile_completion}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground">{profile.profile_completion}%</span>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border border-border bg-white p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-foreground">Admin Notes</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this approval decision..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={4}
            />
          </div>

          {/* Decision Buttons */}
          <div className="border border-border bg-white p-6 rounded-lg space-y-3">
            <button
              onClick={handleApprove}
              disabled={actioning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {actioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve Profile
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={actioning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-slate-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-60"
            >
              {actioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
              Request Changes
            </button>
            <button
              onClick={handleReject}
              disabled={actioning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {actioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject Profile
            </button>
          </div>

          {/* Meta Info */}
          <div className="border border-border bg-white p-6 rounded-lg space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Submitted</p>
              <p className="font-medium text-foreground">
                {profile.submitted_at ? new Date(profile.submitted_at).toLocaleDateString() : "—"}
              </p>
            </div>
            {profile.reviewed_at && (
              <div>
                <p className="text-muted-foreground">Last Reviewed</p>
                <p className="font-medium text-foreground">{new Date(profile.reviewed_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
