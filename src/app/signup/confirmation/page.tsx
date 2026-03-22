"use client";

import Link from "next/link";
import { CheckCircle2, Eye, Edit, TrendingUp, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupConfirmationPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Your Profile Is Live
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Your MasseurMatch profile has been approved and is now live. Clients
          can now discover your listing and contact you directly through the
          information on your profile.
        </p>
      </div>

      {/* Suggested next actions */}
      <Card className="mx-auto max-w-sm text-left">
        <CardContent className="space-y-3 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Next Steps
          </h3>
          <Link
            href="/pro/dashboard"
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-bg-subtle"
          >
            <Eye className="h-5 w-5 text-brand-secondary" />
            <span className="text-sm font-medium">View My Live Profile</span>
          </Link>
          <Link
            href="/pro/dashboard"
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-bg-subtle"
          >
            <Edit className="h-5 w-5 text-brand-secondary" />
            <span className="text-sm font-medium">Edit My Profile</span>
          </Link>
          <Link
            href="/pro/billing"
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-bg-subtle"
          >
            <TrendingUp className="h-5 w-5 text-brand-secondary" />
            <span className="text-sm font-medium">Upgrade My Visibility</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-bg-subtle"
          >
            <Home className="h-5 w-5 text-brand-secondary" />
            <span className="text-sm font-medium">Return Home</span>
          </Link>
        </CardContent>
      </Card>

      {/* Upgrade callout */}
      <Card className="border-brand-secondary/20 bg-brand-secondary/5">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Want more visibility?</strong>{" "}
            Upgrade your listing to improve placement and profile exposure.
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-3">
            <Link href="/pro/billing">Upgrade Plan</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
