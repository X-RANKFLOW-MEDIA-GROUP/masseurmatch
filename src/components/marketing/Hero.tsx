import HeroClient from "@/components/marketing/HeroClient";
import type { PublicTherapist } from "@/app/_lib/directory";

export function Hero({ therapists = [] }: { therapists?: PublicTherapist[] }) {
  return <HeroClient therapists={therapists} />;
}
