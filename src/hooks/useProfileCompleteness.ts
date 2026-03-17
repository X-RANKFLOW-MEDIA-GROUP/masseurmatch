type MissingField = {
  key: string;
  label: string;
  description: string;
  link: string;
};

type CompletenessStep = {
  key: string;
  label: string;
  description: string;
  link: string;
  done: boolean;
};

type CompletenessResult = {
  score: number;
  isPublishReady: boolean;
  missingRequired: MissingField[];
  steps: CompletenessStep[];
};

const REQUIRED_FIELDS: Array<{ key: string; label: string; description: string; link: string }> = [
  { key: "display_name", label: "Display name", description: "Choose the public name clients will see.", link: "/dashboard/profile" },
  { key: "bio", label: "Bio", description: "Add a clear, trustworthy service summary.", link: "/dashboard/profile" },
  { key: "city", label: "City", description: "Set your main service location.", link: "/dashboard/location" },
  { key: "specialties", label: "Specialties", description: "List your massage techniques and focus areas.", link: "/dashboard/profile" },
  { key: "photos", label: "Photos", description: "Upload at least one quality profile photo.", link: "/dashboard/photos" },
];

export function getProfileCompleteness(profile: Record<string, unknown> | null | undefined, base = 0): CompletenessResult {
  if (!profile) {
    return {
      score: base,
      isPublishReady: false,
      missingRequired: REQUIRED_FIELDS,
      steps: REQUIRED_FIELDS.map((field) => ({ ...field, done: false })),
    };
  }

  const steps = REQUIRED_FIELDS.map((field) => {
    const value = profile[field.key];
    const done = Array.isArray(value) ? value.length > 0 : Boolean(value);
    return { ...field, done };
  });

  if (typeof base === "number") {
    const photoStep = steps.find((step) => step.key === "photos");
    if (photoStep) photoStep.done = base > 0;
  }

  const missingRequired = steps.filter((step) => !step.done);

  const completed = steps.length - missingRequired.length;
  const ratio = steps.length === 0 ? 1 : completed / steps.length;
  const score = Math.max(base, Math.round(ratio * 100));

  return {
    score,
    isPublishReady: missingRequired.length === 0,
    missingRequired,
    steps,
  };
}
