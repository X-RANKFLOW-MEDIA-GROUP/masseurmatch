"use client";

export { ApiError, deleteJson, postJson, requestJson } from "@/app/_lib/client-api";

type QueryValue = string | number | boolean | null | undefined;

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
