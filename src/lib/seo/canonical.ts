export function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/\/+/g, "-");
}

export function normalizePath(path: string): string {
  const noQuery = path.split("?")[0] || "/";
  const cleaned = noQuery.replace(/\/+/g, "/").toLowerCase();
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    return cleaned.slice(0, -1);
  }
  return cleaned || "/";
}

export function canonicalForPath(path: string): string {
  return normalizePath(path);
}
