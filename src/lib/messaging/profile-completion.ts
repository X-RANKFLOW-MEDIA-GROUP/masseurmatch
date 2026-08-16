export const PROFILE_COMPLETION_AUDIT_VERSION = "imessage-profile-v1";

export type ProfileCompletionField =
  | "headline"
  | "bio"
  | "city"
  | "state"
  | "languages"
  | "massage_techniques"
  | "years_experience"
  | "service_mode"
  | "pricing"
  | "photo";

export type EditableProfileField = Exclude<ProfileCompletionField, "photo">;

type ProfileLike = Record<string, unknown>;

export type ParsedProfileAnswer =
  | { ok: true; value: unknown; preview: string }
  | { ok: false; error: string };

const FIELD_PRIORITY: ProfileCompletionField[] = [
  "headline",
  "bio",
  "city",
  "state",
  "languages",
  "massage_techniques",
  "years_experience",
  "service_mode",
  "pricing",
  "photo",
];

const FIELD_LABELS: Record<ProfileCompletionField, string> = {
  headline: "headline",
  bio: "bio",
  city: "city",
  state: "state",
  languages: "languages",
  massage_techniques: "massage techniques",
  years_experience: "experience",
  service_mode: "incall/outcall setup",
  pricing: "pricing",
  photo: "profile photo",
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function positiveNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0;
}

function hasJsonContent(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return false;
}

export function normalizePhoneE164(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15 && digits[0] !== "0") {
    return `+${digits}`;
  }

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return null;
}

export function getProfileCompletionAudit(profile: ProfileLike, photoCount = 0) {
  const missing: ProfileCompletionField[] = [];

  if (!text(profile.headline) && !text(profile.tagline)) missing.push("headline");
  if (!text(profile.bio)) missing.push("bio");
  if (!text(profile.city)) missing.push("city");
  if (!text(profile.state)) missing.push("state");

  const languages = Array.from(
    new Set([...stringArray(profile.languages), ...stringArray(profile.languages_spoken)]),
  );
  if (languages.length === 0) missing.push("languages");

  const techniques = Array.from(
    new Set([
      ...stringArray(profile.massage_techniques),
      ...stringArray(profile.modalities),
      ...stringArray(profile.service_categories),
      text(profile.modality),
    ].filter(Boolean)),
  );
  if (techniques.length === 0) missing.push("massage_techniques");

  if (!positiveNumber(profile.years_experience) && !positiveNumber(profile.start_year)) {
    missing.push("years_experience");
  }

  const hasServiceMode =
    profile.offers_incall === true ||
    profile.offers_outcall === true ||
    profile.incall === true ||
    profile.outcall === true;
  if (!hasServiceMode) missing.push("service_mode");

  const hasPricing =
    positiveNumber(profile.incall_price) ||
    positiveNumber(profile.outcall_price) ||
    positiveNumber(profile.starting_price) ||
    positiveNumber(profile.starting_rate) ||
    positiveNumber(profile.price_min) ||
    positiveNumber(profile.price_max) ||
    hasJsonContent(profile.pricing_sessions) ||
    hasJsonContent(profile.rates);
  if (!hasPricing) missing.push("pricing");

  const hasPhoto = photoCount > 0 || Boolean(text(profile.avatar_url) || text(profile.photo_url));
  if (!hasPhoto) missing.push("photo");

  const ordered = FIELD_PRIORITY.filter((field) => missing.includes(field));

  return {
    version: PROFILE_COMPLETION_AUDIT_VERSION,
    missing: ordered,
    missingCount: ordered.length,
    nextField: ordered[0] ?? null,
    complete: ordered.length === 0,
  };
}

export function fieldLabel(field: ProfileCompletionField) {
  return FIELD_LABELS[field];
}

export function summarizeMissingFields(fields: ProfileCompletionField[], max = 4) {
  const labels = fields.slice(0, max).map(fieldLabel);
  if (!labels.length) return "nothing essential";
  const suffix = fields.length > max ? ` and ${fields.length - max} more` : "";
  return `${labels.join(", ")}${suffix}`;
}

export function questionForField(field: ProfileCompletionField) {
  switch (field) {
    case "headline":
      return "What short headline would you like on your profile? For example: Deep Tissue and Sports Massage Specialist.";
    case "bio":
      return "Tell me a little about your massage practice and what clients can expect. I can save that as your profile bio.";
    case "city":
      return "What city should your MasseurMatch profile show?";
    case "state":
      return "What state should your profile show? You can reply with the state name or abbreviation.";
    case "languages":
      return "What languages do you speak? You can reply with a comma separated list, like English, Spanish, Portuguese.";
    case "massage_techniques":
      return "Which massage techniques do you genuinely offer? You can list them separated by commas.";
    case "years_experience":
      return "How many years of massage experience do you have?";
    case "service_mode":
      return "Do you offer incall, outcall, or both?";
    case "pricing":
      return "What are your current rates? Reply like: incall 120, outcall 150. Only list services and prices you actually offer.";
    case "photo":
      return "Your profile still needs a photo. Photos must be uploaded securely from your MasseurMatch profile editor.";
  }
}

function listFromAnswer(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(/[,;/]|\s+and\s+/i)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function clampText(raw: string, max: number, label: string): ParsedProfileAnswer {
  const value = raw.trim();
  if (!value) return { ok: false, error: `Please send your ${label}.` };
  if (value.length > max) {
    return { ok: false, error: `That ${label} is a little too long. Please keep it under ${max} characters.` };
  }
  return { ok: true, value, preview: value };
}

function extractLabeledPrice(raw: string, label: "incall" | "outcall") {
  const escaped = label === "incall" ? "in[- ]?call|incall" : "out[- ]?call|outcall";
  const before = new RegExp(`(?:${escaped})[^0-9]{0,16}\\$?([0-9]{2,4})`, "i").exec(raw);
  if (before?.[1]) return Number(before[1]);
  const after = new RegExp(`\\$?([0-9]{2,4})[^0-9]{0,16}(?:${escaped})`, "i").exec(raw);
  if (after?.[1]) return Number(after[1]);
  return null;
}

export function parseProfileFieldAnswer(
  field: EditableProfileField,
  rawAnswer: string,
  profile: ProfileLike = {},
): ParsedProfileAnswer {
  const raw = rawAnswer.trim();

  if (field === "headline") return clampText(raw, 120, "headline");
  if (field === "bio") return clampText(raw, 1800, "bio");
  if (field === "city") return clampText(raw, 100, "city");
  if (field === "state") return clampText(raw, 80, "state");

  if (field === "languages" || field === "massage_techniques") {
    const values = listFromAnswer(raw).slice(0, 24);
    if (!values.length) {
      return {
        ok: false,
        error: field === "languages" ? "Please list at least one language." : "Please list at least one massage technique you genuinely offer.",
      };
    }
    return { ok: true, value: values, preview: values.join(", ") };
  }

  if (field === "years_experience") {
    const match = raw.match(/\b([0-9]{1,2})\b/);
    const years = match ? Number(match[1]) : NaN;
    if (!Number.isInteger(years) || years < 1 || years > 70) {
      return { ok: false, error: "Please reply with your number of years of massage experience, from 1 to 70." };
    }
    return { ok: true, value: years, preview: `${years} year${years === 1 ? "" : "s"}` };
  }

  if (field === "service_mode") {
    const normalized = raw.toLowerCase().replace(/[- ]/g, "");
    const mentionsIncall = normalized.includes("incall");
    const mentionsOutcall = normalized.includes("outcall");
    const both = normalized.includes("both") || (mentionsIncall && mentionsOutcall);

    if (both) {
      return {
        ok: true,
        value: { offers_incall: true, offers_outcall: true, incall: true, outcall: true },
        preview: "incall and outcall",
      };
    }
    if (mentionsIncall) {
      return {
        ok: true,
        value: { offers_incall: true, offers_outcall: false, incall: true, outcall: false },
        preview: "incall",
      };
    }
    if (mentionsOutcall) {
      return {
        ok: true,
        value: { offers_incall: false, offers_outcall: true, incall: false, outcall: true },
        preview: "outcall",
      };
    }
    return { ok: false, error: "Please reply with incall, outcall, or both." };
  }

  const incallPrice = extractLabeledPrice(raw, "incall");
  const outcallPrice = extractLabeledPrice(raw, "outcall");
  const offersIncall = profile.offers_incall === true || profile.incall === true;
  const offersOutcall = profile.offers_outcall === true || profile.outcall === true;

  if (incallPrice || outcallPrice) {
    const value: Record<string, number> = {};
    if (incallPrice) value.incall_price = incallPrice;
    if (outcallPrice) value.outcall_price = outcallPrice;
    const preview = [
      incallPrice ? `$${incallPrice} incall` : null,
      outcallPrice ? `$${outcallPrice} outcall` : null,
    ].filter(Boolean).join(", ");
    return { ok: true, value, preview };
  }

  const single = raw.match(/\$?([0-9]{2,4})/);
  if (single) {
    const price = Number(single[1]);
    if (offersIncall && !offersOutcall) {
      return { ok: true, value: { incall_price: price }, preview: `$${price} incall` };
    }
    if (offersOutcall && !offersIncall) {
      return { ok: true, value: { outcall_price: price }, preview: `$${price} outcall` };
    }
  }

  return {
    ok: false,
    error: "Please label the rate, for example: incall 120, outcall 150.",
  };
}

export function profilePatchForField(field: EditableProfileField, value: unknown): Record<string, unknown> {
  switch (field) {
    case "headline":
    case "bio":
    case "city":
    case "state":
    case "languages":
    case "massage_techniques":
    case "years_experience":
      return { [field]: value };
    case "service_mode":
    case "pricing":
      if (!value || typeof value !== "object" || Array.isArray(value)) return {};
      return { ...(value as Record<string, unknown>) };
  }
}
