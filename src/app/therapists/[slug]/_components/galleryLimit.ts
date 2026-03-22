import type { TherapistTier } from "@/app/_lib/directory";

export function galleryLimit(tier: TherapistTier | null): number {
  if (tier === "elite") return 12;
  if (tier === "pro") return 9;
  return 5;
}
