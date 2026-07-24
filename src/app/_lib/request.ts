"use client";

import {
  ApiError,
  deleteJson,
  postJson,
  requestJson as baseRequestJson,
} from "@/app/_lib/client-api";

export { ApiError, deleteJson, postJson };

type QueryValue = string | number | boolean | null | undefined;
type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : null;
}

function asImageUrl(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isAiCoachRequest(input: RequestInfo | URL): boolean {
  const url = typeof input === "string" ? input : input.toString();
  return url.split("?", 1)[0].endsWith("/api/pro/ai-coach");
}

function normalizeAiCoachPayload<T>(payload: T): T {
  const root = asRecord(payload);
  if (!root) return payload;

  const analysis = asRecord(root.analysis);
  const scores = asRecord(analysis?.scores);
  if (scores && typeof scores.overall === "number") {
    const profileScore = Math.max(0, Math.min(100, Math.round(scores.overall)));
    scores.overall = profileScore;
    scores.completion = profileScore;
  }

  const sourcePhotos = Array.isArray(root.photos) ? root.photos : [];
  const normalizedPhotos = sourcePhotos.map((entry) => {
    const photo = asRecord(entry);
    if (!photo) return entry;

    const resolvedUrl = asImageUrl(photo.storage_path) || asImageUrl(photo.url);
    return resolvedUrl ? { ...photo, url: resolvedUrl } : photo;
  });

  if (sourcePhotos.length > 0) {
    root.photos = normalizedPhotos;
  }

  const photoRecords = normalizedPhotos
    .map(asRecord)
    .filter((photo): photo is UnknownRecord => photo !== null);

  const primaryPhoto =
    photoRecords.find(
      (photo) =>
        photo.is_primary === true && photo.moderation_status === "approved",
    ) ||
    photoRecords.find((photo) => photo.is_primary === true) ||
    photoRecords.find((photo) => photo.moderation_status === "approved") ||
    photoRecords.find((photo) => asImageUrl(photo.url) !== null);

  const profile = asRecord(root.profile);
  if (profile) {
    const primaryPhotoUrl = asImageUrl(primaryPhoto?.url);
    const existingProfileUrl =
      asImageUrl(profile.photo_url) || asImageUrl(profile.avatar_url);

    if (primaryPhotoUrl || existingProfileUrl) {
      profile.photo_url = primaryPhotoUrl || existingProfileUrl;
    }
  }

  return payload;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const payload = await baseRequestJson<T>(input, init);
  return isAiCoachRequest(input) ? normalizeAiCoachPayload(payload) : payload;
}

export function withSearchParams(
  pathname: string,
  params: Record<string, QueryValue | QueryValue[]>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== null && entry !== undefined && entry !== "") {
          searchParams.append(key, String(entry));
        }
      });
      return;
    }

    if (value !== null && value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
