"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { SignupProvider } from "../_lib/signup-context";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AuroraBackgroundLight } from "@/components/ui/aurora-background";

const STEPS = [
  { path: "/signup", label: "Start" },
  { path: "/signup/plan", label: "Plan" },
  { path: "/signup/account", label: "Account" },
  { path: "/signup/verify", label: "Verify" },
  { path: "/signup/profile", label: "Profile" },
  { path: "/signup/migration", label: "Migration" },
  { path: "/signup/review", label: "Review" },
] as const;

// Pages that don't show the stepper (post-submission)
const NO_STEPPER = ["/signup/pending", "/signup/confirmation", "/signup/rejected", "/signup/resubmit"];

function ProgressStepper() {
  const pathname = usePathname();
  const currentIdx = STEPS.findIndex((s) => s.path === pathname);
  const showStepper = currentIdx >= 0 && !!pathname && !NO_STEPPER.includes(pathname);

  if (!showStepper) return null;

  return (
    <nav aria-label="Sign up progress" className="mx-auto mb-8 mt-4 flex w-full max-w-2xl items-center justify-between gap-1 px-4">
      {STEPS.map((step, idx) => {
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step.path} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isComplete && "border-green-500 bg-green-500 text-white",
                  isCurrent && "border-brand-secondary bg-brand-secondary/10 text-brand-secondary",
                  !isComplete && !isCurrent && "border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
              </div>
            </div>
            <span
              className={cn(
                "text-[11px] font-medium",
                isCurrent ? "text-brand-secondary" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

export function SignupShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect authenticated users who are in the signup flow
    // (after account creation, they need to complete verification, profile, etc.)
    // Only redirect if they're on the entry page (/signup) and already authenticated
    if (!loading && user && pathname === "/signup") {
      router.replace("/pro/dashboard");
    }
  }, [loading, user, pathname, router]);

  return (
    <SignupProvider>
      <AuroraBackgroundLight className="min-h-[calc(100vh-74px)]">
        <ProgressStepper />
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">{children}</div>
      </AuroraBackgroundLight>
    </SignupProvider>
  );
}
