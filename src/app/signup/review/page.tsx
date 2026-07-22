"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSignup } from "../_lib/signup-context";
import { getPlanByTier } from "../_lib/plans";

export default function SignupReviewPage() {
  const router = useRouter();
  const { state, setSubmissionStatus } = useSignup();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = state.selectedPlanTier ? getPlanByTier(state.selectedPlanTier) : null;
  const profile = state.profile;
  const identityVerified = state.identityVerificationStatus === "verified";

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      if (!state.termsAccepted) throw new Error("You must accept the Terms of Service.");
      if (!state.complianceAcknowledged) throw new Error("You must accept the Therapist Agreement.");
      if (!state.ageAndConductAttested) throw new Error("You must confirm that you are at least 18 years old.");

      const response = await fetch("/api/signup/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: state.selectedPlanTier,
          profile: {
            fullName: state.fullName,
            displayName: state.displayName || state.fullName,
            email: state.email,
            phone: state.phone,
            tagline: profile.tagline,
            bio: profile.bio,
            yearsExperience: profile.yearsExperience,
            languages: profile.languages,
            education: profile.education,
            certifications: profile.certifications,
            city: profile.city,
            state: profile.state,
            neighborhood: profile.neighborhood,
            visitingCities: profile.visitingCities,
            locationType: profile.locationType,
            serviceCategories: profile.serviceCategories,
            sessionLengths: profile.sessionLengths,
            startingPrice: profile.startingPrice,
            pricingSessions: profile.pricingSessions,
            pricingMode: profile.pricingMode,
            addOns: profile.addOns,
            availableNow: profile.availableNow,
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

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Submission failed. Please try again.");

      setSubmissionStatus(identityVerified ? "approved" : "pending_approval");
      router.push(body.next || "/pro/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Submission failed.");
    } finally {
      setLoading(false);
    }
  }

  const firstRate = profile.pricingSessions?.find((session) =>
    typeof session.incall_rate === "number" || typeof session.outcall_rate === "number",
  );
  const rateSummary = profile.pricingMode === "ask_me"
    ? "Ask Me"
    : firstRate
      ? `${firstRate.minutes} min · ${firstRate.incall_ask_me ? "Incall: Ask Me" : firstRate.incall_rate != null ? `Incall $${firstRate.incall_rate}` : ""}${firstRate.outcall_ask_me ? " · Outcall: Ask Me" : firstRate.outcall_rate != null ? ` · Outcall $${firstRate.outcall_rate}` : ""}`
      : profile.startingPrice
        ? `From $${profile.startingPrice}`
        : "Not added yet";

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Review Your Profile</h1>
        <p className="mt-3 text-muted-foreground">
          Save your profile now. You can continue editing it from the dashboard while identity verification is pending.
        </p>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <Card className={identityVerified ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}>
        <CardContent className="flex items-start gap-3 p-6">
          {identityVerified ? <ShieldCheck className="mt-0.5 h-5 w-5 text-green-700" /> : <Clock className="mt-0.5 h-5 w-5 text-amber-700" />}
          <div>
            <h2 className="font-semibold text-foreground">{identityVerified ? "Identity verified" : "Identity verification pending"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {identityVerified
                ? "Your profile is eligible for publication. Your next step is plan and payment setup."
                : "Your dashboard remains available. Complete Stripe Identity later to make the profile eligible for public visibility."}
            </p>
            {!identityVerified && <Link href="/signup/verify" className="mt-2 inline-block text-sm font-semibold text-brand-secondary underline">Complete ID verification</Link>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Plan</h2>
          </div>
          {plan ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{plan.name}</p>
                <p className="text-sm text-muted-foreground">Payment is completed after identity verification.</p>
              </div>
              <p className="text-xl font-bold">{plan.priceDisplay}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No paid plan selected yet. You can choose a plan after identity verification; the Free plan remains available.
            </div>
          )}
          {plan && <div className="flex flex-wrap gap-2">{plan.features.slice(0, 4).map((feature) => <Badge key={feature} variant="outline">{feature}</Badge>)}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-display text-lg font-semibold">Profile Summary</h2>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{state.displayName || state.fullName}</span></div>
            <div><span className="text-muted-foreground">Headline:</span> <span className="font-medium">{profile.tagline || "Not added"}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{[profile.neighborhood, profile.city, profile.state].filter(Boolean).join(", ") || "Location not completed"}</span></div>
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{rateSummary}</span></div>
            <div><span className="text-muted-foreground">Services:</span> <span className="font-medium">{profile.serviceCategories.length ? profile.serviceCategories.join(", ") : "Not completed"}</span></div>
            <div className="flex items-center gap-2"><Camera className="h-4 w-4 text-muted-foreground" /><span>{(profile.profilePhoto ? 1 : 0) + profile.galleryPhotos.length} selected photo(s)</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-brand-secondary" /><h2 className="font-display text-lg font-semibold">Agreements</h2></div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Terms and Privacy accepted</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Therapist Agreement accepted</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Age 18+ confirmed</li>
          </ul>
        </CardContent>
      </Card>

      {!state.emailVerified && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Verify your email before saving the profile. <Link href="/signup/verify" className="font-semibold underline">Return to verification</Link>.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline"><Link href="/signup/profile">Back to Edit Profile</Link></Button>
        <Button size="lg" onClick={handleSubmit} disabled={loading || !state.emailVerified || !state.termsAccepted || !state.complianceAcknowledged || !state.ageAndConductAttested}>
          {loading ? "Saving…" : identityVerified ? "Save and Continue to Plan" : "Save and Open Dashboard"}
        </Button>
      </div>
    </div>
  );
}
