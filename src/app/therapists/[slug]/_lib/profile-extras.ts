import "server-only";

import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export type PublicProfileExtras = {
  zip_code: string | null;
  map_enabled: boolean | null;
  latitude: number | null;
  longitude: number | null;
  massage_setup: string[];
  mobile_extras: string[];
  additional_services: string[];
  studio_amenities: string[];
  products_used: string[];
  products_sold: string[];
  payment_methods: string[];
  affiliations: string[];
  rate_disclaimers: string[];
  regular_discounts: string[];
  education_entries: Array<Record<string, unknown>>;
  day_of_week_discount: Record<string, unknown> | null;
  start_date: string | null;
};

const EMPTY_EXTRAS: PublicProfileExtras = {
  zip_code: null,
  map_enabled: null,
  latitude: null,
  longitude: null,
  massage_setup: [],
  mobile_extras: [],
  additional_services: [],
  studio_amenities: [],
  products_used: [],
  products_sold: [],
  payment_methods: [],
  affiliations: [],
  rate_disclaimers: [],
  regular_discounts: [],
  education_entries: [],
  day_of_week_discount: null,
  start_date: null,
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

export async function getPublicProfileExtras(profileId: string): Promise<PublicProfileExtras> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await (admin as any)
    .from("profiles")
    .select(`
      zip_code, map_enabled, latitude, longitude,
      massage_setup, mobile_extras, additional_services, studio_amenities,
      products_used, products_sold, payment_methods, affiliations,
      rate_disclaimers, regular_discounts, education_entries,
      day_of_week_discount, start_date
    `)
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) return EMPTY_EXTRAS;

  return {
    zip_code: typeof data.zip_code === "string" ? data.zip_code : null,
    map_enabled: typeof data.map_enabled === "boolean" ? data.map_enabled : null,
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
    massage_setup: stringArray(data.massage_setup),
    mobile_extras: stringArray(data.mobile_extras),
    additional_services: stringArray(data.additional_services),
    studio_amenities: stringArray(data.studio_amenities),
    products_used: stringArray(data.products_used),
    products_sold: stringArray(data.products_sold),
    payment_methods: stringArray(data.payment_methods),
    affiliations: stringArray(data.affiliations),
    rate_disclaimers: stringArray(data.rate_disclaimers),
    regular_discounts: stringArray(data.regular_discounts),
    education_entries: Array.isArray(data.education_entries)
      ? data.education_entries.filter((item: unknown) => Boolean(item) && typeof item === "object")
      : [],
    day_of_week_discount: data.day_of_week_discount && typeof data.day_of_week_discount === "object"
      ? data.day_of_week_discount as Record<string, unknown>
      : null,
    start_date: typeof data.start_date === "string" ? data.start_date : null,
  };
}
