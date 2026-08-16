"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  ShieldCheck,
  User,
  MapPin,
  Clock,
  DollarSign,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSignup } from "../_lib/signup-context";
import { getPlanByTier } from "../_lib/plans";

async function uploadPhoto(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/provider/photos/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to upload ${file.name}.`);
  }
}

export default function SignupReviewPage() {
  const router = useRouter();
  const { state, setSubmissionStatus } = useSignup();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = state.selectedPlanTier ? getPlanByTier(state.selectedPlanTier) : null;
  const p = state.profile;
  const photoCount = (p.profilePhoto ? 1 : 0) + p.galleryPhotos.length;

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      if (!state.emailVerified) throw new Error("Email verification must be completed before submitting.");
      if (!state.phone?.trim() || !state.phoneVerified) throw new Error("Phone verification must be completed before submitting.");
      if (state.identityVerificationStatus !== "verified") throw new Error("Identity verification must be completed before submitting.");
      if (!state.termsAccepted) throw new Error("You must accept the Terms of Service before submitting.");
      if (!state.complianceAcknowledged) throw new Error("You must acknowledge the Therapist Agreement and platform policies.");
      if (!state.ageAndConductAttested) throw new Error("You must confirm you are 18+ and provide non-sexual massage therapy only.");
      if (!state.selectedPlanTier) throw new Error("Please select a subscription plan before submitting.");

      const photos: File[] = [
        ...(p.profilePhoto ? [p.profilePhoto] : []),
        ...p.galleryPhotos,
      ];
      for (let i = 0; i < photos.length; i += 1) {
        setUploadProgress(`Uploading photo ${i + 1} of ${photos.length}…`);
        await uploadPhoto(photos[i]);
      }
      setUploadProgress(null);

      const res = await fetch("/api/signup/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: state.selectedPlanTier,
          profile: {
            fullName: state.fullName,
            displayName: state.displayName || state.fullName,
            email: state.email,
            phone: state.phone,
            tagline: p.tagline,
            bio: p.bio,
            yearsExperience: p.yearsExperience,
            languages: p.languages,
            education: p.education,
            certifications: p.certifications,
            city: p.city,
            state: p.state,
            zipCode: p.zipCode,
            neighborhood: p.neighborhood,
            visitingCities: p.visitingCities,
            locationType: p.locationType,
            serviceCategories: p.serviceCategories,
            sessionLengths: p.sessionLengths,
            startingPrice: p.startingPrice,
            addOns: p.addOns,
            availableNow: p.availableNow,
          },
          verification: {
            emailVerified: state.emailVerified,
            phoneVerified: state.phoneVerified,
            identityVerificationStatus: state.identityVerificationStatus,
          },
          termsAccepted: state.termsAccepted,
          complianceAcknowledged: state.complianceAcknowledged,
          ageAndConductAttested: state.ageAndConductAttested,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Submission failed. Please try again.");
      }

      setSubmissionStatus("pending_approval");
      router.push("/signup/pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  }

  const verificationComplete =
    state.emailVerified &&
    Boolean(state.phone?.trim()) &&
    state.phoneVerified &&
    state.identityVerificationStatus === "verified";

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Review Your Sign Up</h1>
        <p className="mt-3 text-muted-foreground">Review everything below before submitting for approval.</p>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}

      {plan && (
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-brand-secondary" /><h2 className="font-display text-lg font-semibold text-foreground">Plan Summary</h2></div>
            <div className="flex items-center justify-between"><div><p className="font-semibold text-foreground">{plan.name}</p><p className="text-sm text-muted-foreground">Billed monthly</p></div><p className="text-xl font-bold text-foreground">{plan.priceDisplay}</p></div>
            <div className="flex flex-wrap gap-1.5">{plan.features.slice(0, 4).map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-secondary" /><h2 className="font-display text-lg font-semibold text-foreground">Verification</h2></div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.emailVerified ? "text-green-500" : "text-muted-foreground"}`} />Email verified</li>
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.phoneVerified ? "text-green-500" : "text-muted-foreground"}`} />Phone verified</li>
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.identityVerificationStatus === "verified" ? "text-green-500" : "text-muted-foreground"}`} />Identity reviewed and verified by MasseurMatch</li>
          </ul>
          <p className="text-xs text-muted-foreground">Identity verification confirms identity only. It does not verify professional licensing, background, qualifications, or services.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2"><User className="h-5 w-5 text-brand-secondary" /><h2 className="font-display text-lg font-semibold text-foreground">Profile Summary</h2></div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Name:</span>{" "}<span className="font-medium">{state.displayName || state.fullName}</span></div>
            <div><span className="text-muted-foreground">Tagline:</span>{" "}<span className="font-medium">{p.tagline || "—"}</span></div>
            <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{[p.neighborhood, p.city, p.state].filter(Boolean).join(", ") || "—"}</span></div>
            <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{p.startingPrice ? `From $${p.startingPrice}` : "—"}</span></div>
            <div><span className="text-muted-foreground">Services:</span>{" "}<span className="font-medium">{p.serviceCategories.length > 0 ? p.serviceCategories.join(", ") : "—"}</span></div>
            <div className="flex items-center gap-1"><Camera className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{photoCount > 0 ? `${photoCount} photo(s) — uploaded on submit` : "No photos — you can add them from your dashboard"}</span></div>
            <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{p.availableNow ? "Available Now active" : "Available Now off"}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-brand-secondary" /><h2 className="font-display text-lg font-semibold text-foreground">Legal</h2></div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.termsAccepted ? "text-green-500" : "text-muted-foreground"}`} />Terms of Service accepted</li>
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.complianceAcknowledged ? "text-green-500" : "text-muted-foreground"}`} />Content compliance acknowledged</li>
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.ageAndConductAttested ? "text-green-500" : "text-muted-foreground"}`} />18+ and non-sexual services attested</li>
            <li className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${state.identityVerificationStatus === "verified" ? "text-green-500" : "text-muted-foreground"}`} />Identity verification completed</li>
            <li className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" />Submission subject to moderation</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-600" /><h2 className="font-display text-lg font-semibold text-foreground">Payment Notice</h2></div>
          <p className="mt-2 text-sm text-muted-foreground">Paid MasseurMatch memberships are processed through PayPal. MasseurMatch does not process payments between clients and providers.</p>
        </CardContent>
      </Card>

      {!verificationComplete && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">Complete email, phone, and identity verification on the <Link href="/signup/verify" className="font-medium underline">Verify step</Link> before submitting.</p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline"><Link href="/signup/profile">Back to Edit Profile</Link></Button>
        <Button size="lg" onClick={handleSubmit} disabled={loading || !verificationComplete || !state.termsAccepted || !state.complianceAcknowledged || !state.ageAndConductAttested}>{loading ? uploadProgress ?? "Submitting…" : "Submit for Review"}</Button>
      </div>
    </div>
  );
}
