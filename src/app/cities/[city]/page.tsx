import { notFound, redirect } from "next/navigation";

import { getCities } from "@/app/_lib/directory";
import { resolveCitySlug } from "@/app/_lib/city-routing";

type Params = { city: string };

export const dynamic = "force-dynamic";

export default async function LegacyCityRoute({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const citySlug = resolveCitySlug(resolved.city);

  if (!citySlug || !getCities().some((city) => city.slug === citySlug)) {
    notFound();
  }

  redirect(`/${citySlug}`);
}
