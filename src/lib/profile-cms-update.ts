import type { Database, Json } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const PROFILE_CMS_UPDATE_FIELDS = [
  "display_name",
  "full_name",
  "avatar_url",
  "email",
  "slug",
  "bio",
  "education",
  "training",
  "certifications",
  "massage_setup",
  "incall_amenities",
  "mobile_extras",
  "products_used",
  "products_sold",
  "studio_amenities",
  "affiliations",
  "pricing_sessions",
  "regular_discounts",
  "day_of_week_discount",
  "weekly_special",
  "business_hours",
  "incall",
  "outcall",
  "traveling",
  "starting_price",
  "outcall_radius_miles",
  "seo_title",
  "seo_description",
  "presentation_video_url",
  "social_media",
  "tagline",
  "booking_platform",
  "booking_url",
  "keyword_slugs",
  "custom_faq",
  "years_experience",
  "seo_keywords",
] as const satisfies readonly (keyof ProfileUpdate & keyof ProfileRow)[];

export type ProfileCmsUpdateField = (typeof PROFILE_CMS_UPDATE_FIELDS)[number];
export type ProfileCmsUpdateValue = Exclude<
  ProfileUpdate[ProfileCmsUpdateField],
  undefined
>;

export function isProfileCmsUpdateField(value: string): value is ProfileCmsUpdateField {
  return PROFILE_CMS_UPDATE_FIELDS.some((field) => field === value);
}

function invalidValue(fieldName: ProfileCmsUpdateField, expected: string): never {
  throw new TypeError(`Field "${fieldName}" must be ${expected}.`);
}

function toNullableString(
  fieldName: ProfileCmsUpdateField,
  value: unknown,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return invalidValue(fieldName, "a string or null");
}

function toSerializedString(
  fieldName: ProfileCmsUpdateField,
  value: unknown,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;

  const serialized = JSON.stringify(toProfileCmsJson(value));
  if (serialized === undefined) {
    return invalidValue(fieldName, "JSON-serializable");
  }
  return serialized;
}

function toStringArray(
  fieldName: ProfileCmsUpdateField,
  value: unknown,
): string[] | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }
  return invalidValue(fieldName, "an array of strings or null");
}

function toNullableNumber(
  fieldName: ProfileCmsUpdateField,
  value: unknown,
): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return invalidValue(fieldName, "a finite number or null");
}

function toNullableBoolean(
  fieldName: ProfileCmsUpdateField,
  value: unknown,
): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  return invalidValue(fieldName, "a boolean or null");
}

export function toProfileCmsJson(value: unknown): Json {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (Number.isFinite(value)) return value;
    throw new TypeError("JSON numbers must be finite.");
  }
  if (Array.isArray(value)) {
    return value.map((item) => toProfileCmsJson(item));
  }
  if (typeof value === "object") {
    const result: { [key: string]: Json | undefined } = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = toProfileCmsJson(item);
    }
    return result;
  }
  throw new TypeError("Value is not JSON-serializable.");
}

function assignProfileCmsUpdateValue(
  update: ProfileUpdate,
  fieldName: ProfileCmsUpdateField,
  value: unknown,
): ProfileCmsUpdateValue {
  switch (fieldName) {
    case "display_name":
    case "full_name":
    case "avatar_url":
    case "email":
    case "slug":
    case "bio":
    case "seo_title":
    case "seo_description":
    case "presentation_video_url":
    case "tagline":
    case "booking_platform":
    case "booking_url": {
      const normalized = toNullableString(fieldName, value);
      update[fieldName] = normalized;
      return normalized;
    }

    case "education":
    case "training":
    case "certifications": {
      const normalized = toSerializedString(fieldName, value);
      update[fieldName] = normalized;
      return normalized;
    }

    case "massage_setup":
    case "incall_amenities":
    case "mobile_extras":
    case "products_used":
    case "products_sold":
    case "studio_amenities":
    case "affiliations":
    case "keyword_slugs":
    case "seo_keywords": {
      const normalized = toStringArray(fieldName, value);
      update[fieldName] = normalized;
      return normalized;
    }

    case "pricing_sessions":
    case "regular_discounts":
    case "day_of_week_discount":
    case "weekly_special":
    case "business_hours":
    case "social_media":
    case "custom_faq": {
      const normalized = toProfileCmsJson(value);
      update[fieldName] = normalized;
      return normalized;
    }

    case "incall":
    case "outcall":
    case "traveling": {
      const normalized = toNullableBoolean(fieldName, value);
      update[fieldName] = normalized;
      return normalized;
    }

    case "starting_price":
    case "outcall_radius_miles":
    case "years_experience": {
      const normalized = toNullableNumber(fieldName, value);
      update[fieldName] = normalized;
      return normalized;
    }
  }
}

export function createProfileCmsUpdate(
  fieldName: ProfileCmsUpdateField,
  value: unknown,
  updatedAt = new Date().toISOString(),
): { payload: ProfileUpdate; normalizedValue: ProfileCmsUpdateValue } {
  const payload: ProfileUpdate = { updated_at: updatedAt };
  const normalizedValue = assignProfileCmsUpdateValue(payload, fieldName, value);
  return { payload, normalizedValue };
}
