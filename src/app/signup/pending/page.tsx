"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Send, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_ITEMS = [
  { icon: CheckCircle2, label: "Account created", done: true },
  { icon: ShieldCheck, label: "Identity verified", done: true },
  { icon: Send, label: "Profile submitted", done: true },
  { icon: Clock, label: "Review in progress", done: false },
];

export default function SignupPendingPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-8 w-8 text-amber-600" />
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Your Profile Has Been Submitted
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Thanks for signing up for MasseurMatch. Your account, identity
          verification, and profile submission have been received successfully
          and are now under review.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          We typically review profiles within 24 hours. You will be notified by
          email once your listing is approved or if additional information is
          needed.
        </p>
      </div>

      {/* Status checklist */}
      <Card className="mx-auto max-w-sm text-left">
        <CardContent className="space-y-3 p-6">
          {STATUS_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon
                className={`h-5 w-5 ${
                  item.done ? "text-green-500" : "text-amber-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  item.done ? "text-foreground" : "text-amber-600"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pro/dashboard">
            <User className="mr-2 h-4 w-4" />
            View My Draft Profile
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
