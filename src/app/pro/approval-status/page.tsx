"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { requestJson } from "@/app/_lib/request";

type ProfileStatus = {
  id: string;
  display_name: string | null;
  full_name: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "changes_requested";
  submitted_at: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  completion_percentage: number;
  is_verified_identity: boolean;
};

export default function ApprovalStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    requestJson<{ ok: boolean; profile: ProfileStatus }>("/api/pro/profile/status")
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .catch(() => { /* UI shows loading state */ })
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  if (!authLoading && !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-10">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-10">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No profile found</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<ProfileStatus["status"], {
    title: string;
    icon: typeof AlertCircle;
    cardClasses: string;
    iconClass: string;
    titleClass: string;
    descClass: string;
    btnClass: string;
    action: { label: string; href: string } | null;
    description: string;
  }> = {
    draft: {
      title: "Profile Draft",
      icon: AlertCircle,
      cardClasses: "border border-slate-200 bg-slate-50",
      iconClass: "h-6 w-6 text-slate-600 shrink-0 mt-0.5",
      titleClass: "font-semibold text-lg text-slate-900",
      descClass: "mt-1 text-sm text-slate-700",
      btnClass: "inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors bg-slate-600 text-white hover:bg-slate-700",
      description: "Your profile is incomplete. Complete all required fields and submit for review.",
      action: { label: "Continue Setup", href: "/pro/listing" },
    },
    pending_approval: {
      title: "Pending Review",
      icon: Clock,
      cardClasses: "border border-amber-200 bg-amber-50",
      iconClass: "h-6 w-6 text-amber-600 shrink-0 mt-0.5",
      titleClass: "font-semibold text-lg text-amber-900",
      descClass: "mt-1 text-sm text-amber-700",
      btnClass: "inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors bg-amber-600 text-white hover:bg-amber-700",
      description: "Your profile has been submitted and is under review. We typically review profiles within 1-2 business days.",
      action: null,
    },
    approved: {
      title: "Profile Approved",
      icon: CheckCircle2,
      cardClasses: "border border-emerald-200 bg-emerald-50",
      iconClass: "h-6 w-6 text-emerald-600 shrink-0 mt-0.5",
      titleClass: "font-semibold text-lg text-emerald-900",
      descClass: "mt-1 text-sm text-emerald-700",
      btnClass: "inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors bg-emerald-600 text-white hover:bg-emerald-700",
      description: "Your profile is live and visible to clients on MasseurMatch!",
      action: { label: "View Profile", href: "/pro/profile" },
    },
    rejected: {
      title: "Profile Rejected",
      icon: AlertCircle,
      cardClasses: "border border-rose-200 bg-rose-50",
      iconClass: "h-6 w-6 text-rose-600 shrink-0 mt-0.5",
      titleClass: "font-semibold text-lg text-rose-900",
      descClass: "mt-1 text-sm text-rose-700",
      btnClass: "inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors bg-rose-600 text-white hover:bg-rose-700",
      description: "Your profile was not approved. Please review the feedback and update your profile.",
      action: { label: "Update Profile", href: "/pro/listing" },
    },
    changes_requested: {
      title: "Changes Requested",
      icon: AlertCircle,
      cardClasses: "border border-orange-200 bg-orange-50",
      iconClass: "h-6 w-6 text-orange-600 shrink-0 mt-0.5",
      titleClass: "font-semibold text-lg text-orange-900",
      descClass: "mt-1 text-sm text-orange-700",
      btnClass: "inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors bg-orange-600 text-white hover:bg-orange-700",
      description: "Our team has requested some changes to your profile. Please review the feedback and update accordingly.",
      action: { label: "Update Profile", href: "/pro/listing" },
    },
  };

  const currentProfile = profile;
  const config = statusConfig[currentProfile.status];
  const StatusIcon = config.icon;

  function getSubmissionDate(): string {
    const submittedAt = currentProfile.submitted_at;
    if (!submittedAt) return "—";
    const date = new Date(submittedAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getReviewDate(): string {
    const reviewedAt = currentProfile.reviewed_at;
    if (!reviewedAt) return "Pending";
    const date = new Date(reviewedAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Profile Status
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your application and approval status
        </p>
      </div>

      {/* Status Card */}
      <div className={`${config.cardClasses} rounded-lg p-6 space-y-4`}>
        <div className="flex items-start gap-3">
          <StatusIcon className={config.iconClass} />
          <div className="flex-1">
            <h2 className={config.titleClass}>
              {config.title}
            </h2>
            <p className={config.descClass}>
              {config.description}
            </p>
          </div>
        </div>

        {config.action && (
          <Link href={config.action.href} className={config.btnClass}>
            {config.action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Profile Completion */}
      <div className="border border-border bg-white rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Profile Completion</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{currentProfile.completion_percentage}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all"
              style={{ width: `${currentProfile.completion_percentage}%` }}
            />
          </div>
        </div>
        {currentProfile.completion_percentage < 100 && (
          <Link
            href="/pro/listing"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Complete your profile
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Verification Status */}
      <div className="border border-border bg-white rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Verification</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Identity Verification</span>
            {currentProfile.is_verified_identity ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-xs font-medium text-amber-700">
                <AlertCircle className="h-3 w-3" />
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-border bg-white rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Timeline</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-slate-900" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-foreground">Profile Submitted</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getSubmissionDate()}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${
                currentProfile.status !== "draft" && currentProfile.status !== "pending_approval"
                  ? "bg-slate-900"
                  : "bg-slate-300"
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Under Review</p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentProfile.status === "pending_approval" ? "In progress" : "Completed"}
              </p>
            </div>
          </div>

          {currentProfile.reviewed_at && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-slate-900" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Review Complete</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getReviewDate()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Notes */}
      {currentProfile.admin_notes && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-6 space-y-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Admin Feedback</h3>
              <p className="mt-2 text-sm text-amber-700">{currentProfile.admin_notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="border border-border bg-white rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Need Help?</h3>
        <p className="text-sm text-muted-foreground">
          If you have questions about your application status, please contact our support team.
        </p>
        <a
          href="mailto:support@masseurmatch.com"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <MessageSquare className="h-4 w-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
