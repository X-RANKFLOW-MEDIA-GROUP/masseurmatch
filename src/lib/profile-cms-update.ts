import type { Database, Json } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const PROFILE_CMS_UPDATE_FIELDS = [
  "display_name",
  "full_name",
  "avatar_url",
  "email",
  "slug",
  "bio",
  "seo_title",
  "seo_description",
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
    case "seo_description": {
      const normalized = toNullableString(fieldName, value);
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
