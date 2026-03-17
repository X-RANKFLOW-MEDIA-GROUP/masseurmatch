import Link from "next/link";
import { PageSection, StatGrid, Surface } from "@/app/_components/primitives";

type MissingField = {
  key: string;
  label: string;
  link: string;
};

export function ProTools({
  stats,
  isPublishReady,
  missing,
}: {
  stats: Array<{ label: string; value: string; note?: string }>;
  isPublishReady: boolean;
  missing: MissingField[];
}) {
  return (
    <div className="space-y-6">
      <PageSection
        title="Therapist Dashboard"
        description="Track profile readiness, visibility, and quick actions from one place."
      />

      <StatGrid items={stats} />

      <Surface>
        <h2 className="text-xl font-semibold text-foreground">Profile tools</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit your profile details, pricing, and billing settings through the current therapist dashboard.
        </p>

        {!isPublishReady ? (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Missing required fields</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {missing.map((item) => (
                <Link key={item.key} href={item.link} className="text-sm underline">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/pro/profile" className="text-primary hover:underline">
            Edit profile
          </Link>
          <Link href="/pro/billing" className="text-primary hover:underline">
            Manage billing
          </Link>
          <Link href="/dashboard" className="text-primary hover:underline">
            Open full dashboard
          </Link>
        </div>
      </Surface>
    </div>
  );
}
