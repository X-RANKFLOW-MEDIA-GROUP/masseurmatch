import Link from "next/link";
import type { PublicTherapist } from "@/app/_lib/directory";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number | null) => {
  if (!value) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export function PublicTherapistCard({ therapist }: { therapist: PublicTherapist }) {
  const name = therapist.display_name || therapist.full_name || "Therapist";
  const profilePath = `/therapists/${therapist.slug || therapist.id}`;
  const incall = formatCurrency(therapist.incall_price);
  const outcall = formatCurrency(therapist.outcall_price);
  const isPremium = therapist._tier === "pro" || therapist._tier === "elite";
  const tierLabel = isPremium ? "Premium" : therapist._tier === "standard" ? "Verified" : "Directory";

  return (
    <article className="brand-surface card-hover rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {tierLabel} listing
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            <Link href={profilePath} className="hover:underline">
              {name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{therapist.city || "United States"}</p>
        </div>
        {therapist.review_count ? (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {therapist.review_count} reviews
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant={isPremium ? "premium" : therapist._tier === "standard" ? "default" : "secondary"}>
          {tierLabel}
        </Badge>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {therapist.bio || "Profile details are still being completed. Visit the full listing for contact preferences and specialties."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(therapist.specialties || []).slice(0, 4).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground"
          >
            {specialty}
          </span>
        ))}
        {therapist.modality ? (
          <span className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {therapist.modality}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {incall ? <span>Incall {incall}</span> : null}
        {outcall ? <span>Outcall {outcall}</span> : null}
        {therapist.profile_views ? <span>{therapist.profile_views} profile views</span> : null}
      </div>

      <div className="mt-5">
        <Link href={profilePath} className="text-sm font-semibold text-primary hover:underline">
          View full profile
        </Link>
      </div>
    </article>
  );
}
