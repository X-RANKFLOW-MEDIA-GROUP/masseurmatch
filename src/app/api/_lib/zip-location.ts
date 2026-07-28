import { fetchZipByCode } from "@/lib/profile-autofill";

export type ResolvedLocation = {
  city: string | null;
  state: string | null;
  zip: string | null;
};

// The signup profile step lets providers continue with a ZIP code alone —
// city/state are only auto-filled by a client-side lookup that can fail or
// still be in flight when the form advances. Resolving here guarantees a
// submitted ZIP always yields a city/state server-side, so profiles never
// land in the directory without a location while the ZIP is silently lost.
export async function resolveCityStateFromZip(profile: {
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}): Promise<ResolvedLocation> {
  const city = profile.city?.trim() || null;
  const state = profile.state?.trim() || null;
  const zip = profile.zipCode?.replace(/\D/g, "").slice(0, 5) || null;

  if ((city && state) || !zip || zip.length < 5) {
    return { city, state, zip };
  }

  try {
    const result = await fetchZipByCode(zip);
    if (result) {
      return { city: city ?? result.city, state: state ?? result.stateAbbr, zip };
    }
  } catch {
    // Lookup failures must never block a signup — fall through with what we have.
  }

  return { city, state, zip };
}
