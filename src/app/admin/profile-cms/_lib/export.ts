import { Profile } from "@/lib/profile.types";

export function exportProfiles(profiles: Profile[], format: "json" | "csv") {
  if (format === "json") {
    exportAsJSON(profiles);
  } else {
    exportAsCSV(profiles);
  }
}

function exportAsJSON(profiles: Profile[]) {
  const data = JSON.stringify(profiles, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `profiles-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportAsCSV(profiles: Profile[]) {
  if (profiles.length === 0) return;

  // Get all unique keys
  const keys = new Set<string>();
  profiles.forEach((profile) => {
    Object.keys(profile).forEach((key) => keys.add(key));
  });

  const headers = Array.from(keys).sort();
  const csvHeaders = headers.map((h) => `"${h}"`).join(",");

  const rows = profiles.map((profile) => {
    return headers
      .map((header) => {
        const value = (profile as any)[header];

        // Handle different data types
        if (value === null || value === undefined) {
          return '""';
        }

        if (typeof value === "boolean") {
          return value ? '"true"' : '"false"';
        }

        if (Array.isArray(value)) {
          return `"${value.join("; ")}"`;
        }

        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }

        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });

  const csv = [csvHeaders, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `profiles-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
