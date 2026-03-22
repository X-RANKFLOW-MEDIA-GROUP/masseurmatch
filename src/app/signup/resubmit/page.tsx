"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Camera,
  FileWarning,
  ShieldAlert,
  Image,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";

export default function SignupResubmitPage() {
  const router = useRouter();
  const { state, updateProfile, setSubmissionStatus } = useSignup();
  const p = state.profile;
  const notes = state.moderationNotes;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect which areas need fixes from moderation notes
  const hasPhotoIssue = notes.some(
    (n) => /photo|image|media/i.test(n),
  );
  const hasContentIssue = notes.some(
    (n) => /content|text|bio|tagline/i.test(n),
  );
  const hasVerificationIssue = notes.some(
    (n) => /verif|identity|id check/i.test(n),
  );
  const hasServiceIssue = notes.some(
    (n) => /service|price|rate/i.test(n),
  );

  async function handleResubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/signup/resubmit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            tagline: p.tagline,
            bio: p.bio,
            yearsExperience: p.yearsExperience,
            city: p.city,
            state: p.state,
            neighborhood: p.neighborhood,
            locationType: p.locationType,
            serviceCategories: p.serviceCategories,
            sessionLengths: p.sessionLengths,
            startingPrice: p.startingPrice,
            addOns: p.addOns,
            availableNow: p.availableNow,
          },
          stripeIdentitySessionId: state.stripeIdentitySessionId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Resubmission failed.");
      }

      setSubmissionStatus("submitted");
      router.push("/signup/pending");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Fix and Resubmit Your Profile
        </h1>
        <p className="mt-3 text-muted-foreground">
          Make the requested changes below and resubmit for review.
        </p>
      </div>

      {/* Issue flags */}
      {notes.length > 0 && (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <h3 className="text-sm font-semibold text-amber-800">Issues flagged by reviewer:</h3>
          {notes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span className="text-sm text-amber-900">{note}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleResubmit} className="space-y-8">
        {/* Content section — highlighted if flagged */}
        <Card className={hasContentIssue ? "border-amber-300 bg-amber-50/30" : ""}>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2">
              {hasContentIssue && <FileWarning className="h-5 w-5 text-amber-500" />}
              <h2 className="font-display text-lg font-semibold text-foreground">
                Profile Content
              </h2>
              {hasContentIssue && (
                <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
                  Needs Update
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={p.tagline}
                onChange={(e) => updateProfile({ tagline: e.target.value })}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={p.bio}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                maxLength={1000}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service section — highlighted if flagged */}
        {hasServiceIssue && (
          <Card className="border-amber-300 bg-amber-50/30">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Service Details
                </h2>
                <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
                  Needs Update
                </Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price ($)</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  min="0"
                  value={p.startingPrice}
                  onChange={(e) => updateProfile({ startingPrice: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo section — highlighted if flagged */}
        <Card className={hasPhotoIssue ? "border-amber-300 bg-amber-50/30" : ""}>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-2">
              {hasPhotoIssue && <Image className="h-5 w-5 text-amber-500" />}
              <h2 className="font-display text-lg font-semibold text-foreground">Photos</h2>
              {hasPhotoIssue && (
                <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
                  Needs Update
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile Photo</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  updateProfile({ profilePhoto: file });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="galleryPhotos">Gallery Photos</Label>
              <Input
                id="galleryPhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  updateProfile({ galleryPhotos: files });
                }}
              />
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="mediaCompliance"
                checked={p.mediaCompliance}
                onCheckedChange={(v) => updateProfile({ mediaCompliance: v === true })}
              />
              <Label htmlFor="mediaCompliance" className="text-sm leading-snug">
                I confirm that all uploaded photos are professional and do not contain explicit content.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Verification retry */}
        {hasVerificationIssue && (
          <Card className="border-amber-300 bg-amber-50/30">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Identity Verification
                </h2>
                <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
                  Retry Required
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your identity verification needs to be completed again.
              </p>
              <Button asChild variant="outline">
                <Link href="/signup/verify">Go to Verification</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resubmitting…
            </>
          ) : (
            "Resubmit for Review"
          )}
        </Button>
      </form>
    </div>
  );
}
