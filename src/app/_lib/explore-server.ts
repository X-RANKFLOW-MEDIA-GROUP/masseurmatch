import "server-only";

import {
  getProfilePhotosBatch,
  getPublicTherapists,
} from "@/app/_lib/directory";
import {
  applyExploreFilters,
  getCityCoordinates,
  isHiddenExploreProvider,
  normalizeProvider,
  resolveExploreCity,
  type ExploreFilters,
} from "@/app/_lib/explore";

// Server-side data loading for the explore surface. Kept out of explore.ts so
// client components can import the pure filter/URL helpers without dragging
// the server-only Supabase client into their bundle.
export async function loadExploreProviders(filters: ExploreFilters) {
  const resolvedCity = resolveExploreCity(filters.city, filters.zip);
  const origin = getCityCoordinates(resolvedCity);
  const response = await getPublicTherapists({ page: 1, pageSize: 200 });

  // Attach each provider's approved primary photo so explore cards show the
  // uploaded image rather than a generic stock fallback.
  const photoIds = response.items
    .map((item) => item.id)
    .filter((id): id is string => Boolean(id) && !id.toLowerCase().startsWith("fallback-"));
  const photoMap = await getProfilePhotosBatch(photoIds, 1);
  const withPhotos = response.items.map((profile) => {
    const primary = photoMap.get(profile.id)?.[0];
    return primary ? { ...profile, profile_photo: primary.storage_path } : profile;
  });

  const normalized = withPhotos.map((profile) => normalizeProvider(profile, origin));
  const sorted = applyExploreFilters(normalized, { ...filters, city: resolvedCity });
  const invalidProviderCount = normalized.filter(isHiddenExploreProvider).length;

  return {
    filters: { ...filters, city: resolvedCity },
    origin,
    total: sorted.length,
    items: sorted,
    invalidProviderCount,
  };
}
