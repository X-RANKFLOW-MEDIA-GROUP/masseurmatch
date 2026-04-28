"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Heart, HeartOff, Flag, Loader2, X } from "lucide-react";

interface Props {
  therapistId: string;
  therapistName: string;
  /** Logged-in user id. When absent the buttons still render but prompt a sign-in message. */
  userId?: string;
  userEmail?: string;
  userPhone?: string;
}

type ActionState = "idle" | "loading" | "done" | "error";

const REPORT_REASONS = [
  { value: "fake_profile", label: "Fake or impersonation" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "misleading_information", label: "Misleading information" },
  { value: "spam", label: "Spam or scam" },
  { value: "other", label: "Other" },
] as const;

export function ProfileActionButtons({
  therapistId,
  therapistName,
  userId,
  userEmail,
  userPhone,
}: Props) {
  const [alertActive, setAlertActive] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [alertState, setAlertState] = useState<ActionState>("idle");
  const [favoriteState, setFavoriteState] = useState<ActionState>("idle");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportState, setReportState] = useState<ActionState>("idle");
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportEmail, setReportEmail] = useState(userEmail ?? "");
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  // Fetch initial state when userId is present
  useEffect(() => {
    if (!userId) return;

    const params = new URLSearchParams({ userId, therapistId });

    Promise.all([
      fetch(`/api/alerts?${params}`).then((r) => r.json()),
      fetch(`/api/favorites?${params}`).then((r) => r.json()),
    ]).then(([alertData, favData]) => {
      setAlertActive(Boolean(alertData.active));
      setFavorited(Boolean(favData.saved));
    }).catch(() => {
      // silently ignore — state stays at defaults
    });
  }, [userId, therapistId]);

  const handleAlert = async () => {
    if (!userId) {
      alert("Sign in to receive availability alerts.");
      return;
    }
    setAlertState("loading");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          therapistId,
          email: userEmail,
          phone: userPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlertActive(Boolean(data.active));
      setAlertState("done");
    } catch {
      setAlertState("error");
    } finally {
      setTimeout(() => setAlertState("idle"), 2000);
    }
  };

  const handleFavorite = async () => {
    if (!userId) {
      alert("Sign in to save favorites.");
      return;
    }
    setFavoriteState("loading");
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, therapistId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFavorited(Boolean(data.saved));
      setFavoriteState("done");
    } catch {
      setFavoriteState("error");
    } finally {
      setTimeout(() => setFavoriteState("idle"), 2000);
    }
  };

  const handleReportSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reportReason || !reportEmail) return;
    setReportState("loading");
    setReportFeedback(null);
    try {
      const res = await fetch("/api/profile-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId,
          reporterEmail: reportEmail.trim(),
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportState("done");
      setReportFeedback("Report submitted. Our team will review it shortly.");
      setReportReason("");
      setReportDetails("");
    } catch (err) {
      setReportState("error");
      setReportFeedback(err instanceof Error ? err.message : "Could not submit report.");
    }
  };

  return (
    <div className="mt-4">
      {/* 3-button row */}
      <div className="flex gap-2 flex-wrap">
        {/* Alert Me */}
        <button
          type="button"
          onClick={handleAlert}
          disabled={alertState === "loading"}
          aria-label={alertActive ? "Remove availability alert" : "Alert me when available"}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
            alertActive
              ? "border-[var(--green)] bg-[var(--green-dim)] text-[var(--green)]"
              : "border-[var(--glass-border)] bg-[var(--cream-dim)] text-[var(--cream-soft)] hover:border-[var(--green)] hover:text-[var(--green)]",
          ].join(" ")}
        >
          {alertState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : alertActive ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {alertActive ? "Alert On" : "Alert Me"}
        </button>

        {/* Save as Favorite */}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={favoriteState === "loading"}
          aria-label={favorited ? "Remove from favorites" : "Save as favorite"}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
            favorited
              ? "border-red-400/50 bg-red-500/10 text-red-400"
              : "border-[var(--glass-border)] bg-[var(--cream-dim)] text-[var(--cream-soft)] hover:border-red-400/50 hover:text-red-400",
          ].join(" ")}
        >
          {favoriteState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : favorited ? (
            <HeartOff className="h-4 w-4" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          {favorited ? "Saved" : "Favorite"}
        </button>

        {/* Report Profile */}
        <button
          type="button"
          onClick={() => setReportOpen((v) => !v)}
          aria-label="Report this profile"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--cream-dim)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:border-orange-400/50 hover:text-orange-400"
        >
          <Flag className="h-4 w-4" />
          Report
        </button>
      </div>

      {/* Report drawer */}
      {reportOpen && (
        <div className="mt-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--navy-light)] p-5 text-left shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
              Report Profile
            </p>
            <button
              type="button"
              onClick={() => { setReportOpen(false); setReportFeedback(null); }}
              className="text-[var(--text-muted)] hover:text-[var(--cream)]"
              aria-label="Close report form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-[var(--text-dim)] mb-4">
            Report {therapistName} for a policy violation. Our moderation team reviews every report.
          </p>

          {reportState === "done" ? (
            <p className="text-sm text-[var(--green)]">{reportFeedback}</p>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <select
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--navy-mid)] px-3 py-2 text-sm text-[var(--cream)] focus:outline-none focus:border-[var(--orange)]"
              >
                <option value="">Select a reason…</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <textarea
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Additional details (optional)"
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--navy-mid)] px-3 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--orange)]"
              />

              <input
                required
                type="email"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
                placeholder="Your email (for follow-up)"
                className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--navy-mid)] px-3 py-2 text-sm text-[var(--cream)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--orange)]"
              />

              {reportFeedback && reportState === "error" && (
                <p className="text-sm text-[var(--red)]">{reportFeedback}</p>
              )}

              <button
                type="submit"
                disabled={reportState === "loading"}
                className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500/20 border border-orange-400/40 px-4 py-2.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/30 disabled:opacity-60"
              >
                {reportState === "loading" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Report
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
