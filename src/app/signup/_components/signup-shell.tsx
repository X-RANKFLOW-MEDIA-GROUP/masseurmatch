"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { SignupProvider } from "../_lib/signup-context";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AuroraBackgroundLight } from "@/components/ui/aurora-background";

const ONBOARDING_STEPS = [
  { path: "/signup/account", label: "Account" },
  { path: "/signup/verify", label: "Verify" },
  { path: "/signup/profile", label: "Profile" },
  { path: "/signup/review", label: "Review" },
] as const;

function ProgressStepper() {
  const pathname = usePathname();
  const currentIdx = ONBOARDING_STEPS.findIndex((step) => step.path === pathname);
  if (currentIdx < 0) return null;

  return (
    <nav aria-label="Sign up progress" className="mx-auto mb-6 mt-4 flex w-full max-w-xl items-center justify-between gap-2 px-4">
      {ONBOARDING_STEPS.map((step, idx) => {
        const complete = idx < currentIdx;
        const current = idx === currentIdx;
        return (
          <div key={step.path} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                complete && "border-emerald-500 bg-emerald-500 text-white",
                current && "border-brand-secondary bg-brand-secondary/10 text-brand-secondary",
                !complete && !current && "border-border bg-card text-muted-foreground",
              )}
            >
              {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
            </div>
            <span className={cn("text-[11px] font-medium", current ? "text-brand-secondary" : "text-muted-foreground")}>
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
  const isAccountPage = pathname === "/signup/account";

  useEffect(() => {
    if (!loading && user && pathname === "/signup") {
      router.replace("/pro/dashboard");
    }
  }, [loading, user, pathname, router]);

  return (
    <SignupProvider>
      <AuroraBackgroundLight className="min-h-[calc(100vh-74px)]">
        <ProgressStepper />
        <div className={cn("mx-auto w-full px-4 pb-16 sm:px-6", isAccountPage ? "max-w-6xl" : "max-w-5xl")}>
          {children}
        </div>
      </AuroraBackgroundLight>
    </SignupProvider>
  );
}
