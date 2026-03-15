import Image from "next/image";
import Link from "next/link";
import type { City, Therapist } from "@/mm/types";
import { Card, Pill } from "@/mm/components/primitives";

export function TherapistCard({ city, therapist }: { city?: City; therapist: Therapist }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={therapist.photoUrl} alt={therapist.displayName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          <Pill>{therapist.tier}</Pill>
          {therapist.gayFriendly ? <Pill className="bg-primary/10 text-foreground">gay-friendly</Pill> : null}
          {therapist.inclusive ? <Pill>inclusive</Pill> : null}
        </div>
        <div>
          <h3 className="font-display text-2xl text-foreground">{therapist.displayName}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {city ? `${city.name}, ${city.stateCode}` : therapist.citySlug.toUpperCase()} • {therapist.priceRange}
          </p>
        </div>
        <p className="text-sm leading-7 text-muted-foreground">{therapist.bio}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {therapist.modalities.slice(0, 3).map((modality) => (
            <span key={modality} className="rounded-full border border-border px-3 py-1">
              {modality.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <Link href={`/therapists/${therapist.slug}`} className="inline-flex text-sm font-semibold text-foreground underline underline-offset-4">
          View profile
        </Link>
      </div>
    </Card>
  );
}
