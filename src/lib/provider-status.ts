export const PROVIDER_STATUS_VALUES = [
  "available",
  "active",
  "mobile",
  "traveling",
  "hidden",
  "inactive",
] as const;

export type ProviderStatus = (typeof PROVIDER_STATUS_VALUES)[number];

export const PROVIDER_STATUS_OPTIONS: ReadonlyArray<{
  value: ProviderStatus;
  label: string;
}> = [
  { value: "available", label: "Available" },
  { value: "active", label: "Accepting appointments" },
  { value: "mobile", label: "Mobile / outcall" },
  { value: "traveling", label: "Traveling" },
  { value: "hidden", label: "Away" },
  { value: "inactive", label: "Unavailable" },
];

const PROVIDER_STATUS_LABELS = new Map(
  PROVIDER_STATUS_OPTIONS.map((option) => [option.value, option.label]),
);

export function formatProviderStatus(value: string | null | undefined): string {
  if (!value) return "";
  return PROVIDER_STATUS_LABELS.get(value as ProviderStatus) ?? value;
}
