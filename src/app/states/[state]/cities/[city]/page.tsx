import { notFound, redirect } from "next/navigation";

import { getCities } from "@/app/_lib/directory";

type Params = { state: string; city: string };

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const dynamic = "force-dynamic";

export default async function LegacyStateCityRoute({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const city = getCities().find(
    (entry) => toSlug(entry.stateName) === resolved.state && entry.slug === resolved.city,
  );

  if (!city) {
    notFound();
  }

  redirect(`/${city.slug}`);
}
