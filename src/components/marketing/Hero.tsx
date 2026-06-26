import type { PublicTherapist } from "@/app/_lib/directory";
import HeroClient from "@/components/marketing/HeroClient";

type HeroProps = {
  featuredTherapists?: PublicTherapist[];
};

export function Hero({ featuredTherapists = [] }: HeroProps) {
  return <HeroClient featuredTherapists={featuredTherapists} />;
}
