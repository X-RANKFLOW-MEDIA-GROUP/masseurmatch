"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";
import { StepVerification } from "@/components/auth/StepVerification";
import { StepProfile } from "@/components/auth/StepProfile";

type Step = "verify" | "profile" | "done";

function OnboardingForm({ email }: { email: string }) {
	const [step, setStep] = useState<Step>("verify");

	return (
		<div className="rounded-lg border border-border p-6 max-w-2xl">
			<h2 className="text-xl font-semibold">OnboardingForm</h2>
			<p className="text-sm text-muted-foreground mt-2">Complete identity verification, profile basics, and service details to publish your listing.</p>
			<p className="text-xs text-muted-foreground mt-3">Signed in as: {email || "unknown"}</p>

			<div className="mt-5">
				{step === "verify" ? <StepVerification onComplete={() => setStep("profile")} /> : null}
				{step === "profile" ? <StepProfile onComplete={() => setStep("done")} /> : null}
				{step === "done" ? (
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">Onboarding completed. Your profile is now in moderation workflow.</p>
						<div className="flex gap-3">
							<Link className="underline text-sm" href="/pro/dashboard">Go to dashboard</Link>
							<Link className="underline text-sm" href="/dashboard">Open full editor</Link>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default function ProOnboardPage() {
	const { user } = useAuth();

	return (
		<div className="container mx-auto px-4 py-10">
			<h1 className="text-3xl font-bold mb-5">Onboarding</h1>
			<OnboardingForm email={user?.email || ""} />
		</div>
	);
}
