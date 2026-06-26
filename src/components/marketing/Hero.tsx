import type { PublicTherapist } from "@/app/_lib/directory";
import HeroClient from "@/components/marketing/HeroClient";

export function Hero({ therapists = [] }: { therapists?: PublicTherapist[] }) {
  return <HeroClient featuredTherapists={therapists} />;
}
