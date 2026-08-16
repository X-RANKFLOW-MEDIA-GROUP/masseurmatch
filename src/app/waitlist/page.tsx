import type { Metadata } from "next";
import Link from "next/link";

import { createPageMetadata } from "@/app/_lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "MasseurMatch Is Live",
  description:
    "MasseurMatch is live. Browse current public massage provider profiles or create a provider account.",
  path: "/waitlist",
  noIndex: true,
});

export default function WaitlistPage() {
  return (
    <main className="min-h-[70vh] bg-background px-6 py-24 text-foreground sm:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B1E2D]">MasseurMatch</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          The prelaunch waitlist is closed. MasseurMatch is live.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Browse current public provider profiles, search active markets, or create a provider account. Availability, trust signals, services, and location details are shown only when supported by current profile data.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/therapists"
            className="rounded-full bg-[#8B1E2D] px-7 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Browse providers
          </Link>
          <Link
            href="/signup/account"
            className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Create a provider profile
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            How MasseurMatch works
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold">Directory only</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Clients contact independent providers directly. MasseurMatch does not process massage session bookings or payments.
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold">Trust signals are specific</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Profile Reviewed, Identity Verified, and paid Featured placement are separate signals and should not be interpreted as the same thing.
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-semibold">Current data only</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Local service and availability claims are based on current public provider information rather than inferred inventory.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
