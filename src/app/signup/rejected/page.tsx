"use client";

import Link from "next/link";
import { AlertTriangle, AlertCircle, Image, FileWarning, ShieldAlert, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSignup } from "../_lib/signup-context";

const ISSUE_ICONS: Record<string, typeof AlertCircle> = {
  verification: ShieldAlert,
  content: FileWarning,
  media: Image,
  default: AlertCircle,
};

export default function SignupRejectedPage() {
  const { state } = useSignup();
  const notes = state.moderationNotes;

  function getIcon(note: string) {
    if (note.toLowerCase().includes("verification")) return ISSUE_ICONS.verification;
    if (note.toLowerCase().includes("photo") || note.toLowerCase().includes("image") || note.toLowerCase().includes("media"))
      return ISSUE_ICONS.media;
    if (note.toLowerCase().includes("content") || note.toLowerCase().includes("text"))
      return ISSUE_ICONS.content;
    return ISSUE_ICONS.default;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Your Profile Needs Changes Before Approval
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Your submission was reviewed, but we need a few updates before your
          profile can go live. Please review the notes below, make the requested
          edits, and resubmit your profile.
        </p>
      </div>

      {/* Moderation notes */}
      {notes.length > 0 && (
        <Card className="mx-auto max-w-sm text-left">
          <CardContent className="space-y-3 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Issues to Address
            </h3>
            {notes.map((note, idx) => {
              const Icon = getIcon(note);
              return (
                <div key={idx} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <span className="text-sm text-foreground">{note}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {notes.length === 0 && (
        <Card className="mx-auto max-w-sm text-left">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Specific feedback will be sent to your email. Check your inbox
                for detailed moderation notes.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/signup/resubmit">Fix My Profile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
