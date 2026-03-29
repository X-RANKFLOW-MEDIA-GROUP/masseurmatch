"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { TherapistTier } from "@/app/_lib/directory";
import type { CityData } from "@/data/cities";

export type DirectorySession = "" | "home-visit" | "incall";
export type DirectoryObjectiveId =
  | "all"
  | "deep-recovery"
  | "sports-clinical"
  | "stress-relief"
  | "pre-natal";

type DirectoryObjective = {
  id: DirectoryObjectiveId;
  label: string;
  searchValue: string;
  aliases: string[];
};

const PANEL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TIER_LABELS: Record<TherapistTier, string> = {
  free: "Access",
  standard: "Standard",
  pro: "Pro",
  elite: "Elite",
};

export const DIRECTORY_OBJECTIVES: DirectoryObjective[] = [
  {
    id: "all",
    label: "All",
    searchValue: "",
    aliases: [],
  },
  {
    id: "deep-recovery",
    label: "Deep Recovery",
    searchValue: "deep tissue",
    aliases: ["deep", "recovery", "myofascial"],
  },
  {
    id: "sports-clinical",
    label: "Sports Clinical",
    searchValue: "sports",
    aliases: ["sports", "clinical", "mobility", "stretch"],
  },
  {
    id: "stress-relief",
    label: "Stress Relief",
    searchValue: "relaxation",
    aliases: ["relaxation", "stress", "swedish", "lymphatic"],
  },
  {
    id: "pre-natal",
    label: "Pre-Natal",
    searchValue: "prenatal",
    aliases: ["prenatal", "pre natal", "pre-natal", "maternal"],
  },
];

const OBJECTIVE_LOOKUP = new Map(DIRECTORY_OBJECTIVES.map((objective) => [objective.id, objective]));

const normalizeValue = (value: string | null | undefined) => (value || "").trim().toLowerCase();

export function resolveDirectoryObjective(
  goal: string,
  modality: string,
): DirectoryObjective {
  const normalizedGoal = normalizeValue(goal) as DirectoryObjectiveId;
  if (normalizedGoal && OBJECTIVE_LOOKUP.has(normalizedGoal)) {
    return OBJECTIVE_LOOKUP.get(normalizedGoal) || DIRECTORY_OBJECTIVES[0];
  }

  const normalizedModality = normalizeValue(modality);
  const matchedObjective = DIRECTORY_OBJECTIVES.find(
    (objective) =>
      objective.id !== "all" &&
      objective.aliases.some((alias) => normalizedModality.includes(alias)),
  );

  return matchedObjective || DIRECTORY_OBJECTIVES[0];
}

export function getDirectoryObjectiveSearchValue(goal: string, modality = "") {
  return resolveDirectoryObjective(goal, modality).searchValue;
}

export interface AdvancedDirectoryFilterState {
  city: string;
  keyword: string;
  modality: string;
  goal: string;
  session: DirectorySession;
  verified: boolean;
  availableToday: boolean;
  masterOnly: boolean;
  tier: TherapistTier | "";
  lgbtqAffirming: boolean;
}

export interface AdvancedDirectoryFilterProps {
  cities: CityData[];
  filters: AdvancedDirectoryFilterState;
  resultCount: number;
  totalCount: number;
  isPending?: boolean;
  onChange: (updates: Partial<AdvancedDirectoryFilterState>) => void;
  onReset: () => void;
}

function FilterMetric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`min-w-[158px] rounded-[1.2rem] border border-slate-200/80 bg-white/72 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl ${
        compact ? "min-w-[142px]" : ""
      }`}
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1.5 font-sans text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4">
      <span className="font-sans text-sm font-light text-slate-700 transition-colors group-hover:text-slate-950">
        {label}
      </span>
      <span className="relative flex h-5 w-5 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 appearance-none rounded-none border border-slate-300 bg-white text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 checked:border-slate-950 checked:bg-slate-950"
        />
        {checked ? <span className="pointer-events-none absolute h-1.5 w-1.5 bg-white" /> : null}
      </span>
    </label>
  );
}

export function AdvancedDirectoryFilter({
  cities,
  filters,
  resultCount,
  totalCount,
  isPending = false,
  onChange,
  onReset,
}: AdvancedDirectoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(
    Boolean(
      filters.goal ||
        filters.session ||
        filters.verified ||
        filters.availableToday ||
        filters.masterOnly ||
        filters.tier ||
        filters.lgbtqAffirming,
    ),
  );

  const activeObjective = resolveDirectoryObjective(filters.goal, filters.modality);
  const matchedCity = cities.find(
    (city) => normalizeValue(city.name) === normalizeValue(filters.city) || city.slug === normalizeValue(filters.city),
  );
  const cityLabel = matchedCity ? `${matchedCity.name}, ${matchedCity.stateCode}` : filters.city || "All cities";
  const sessionLabel =
    filters.session === "home-visit"
      ? "Home Visit"
      : filters.session === "incall"
        ? "Studio"
        : "Any format";
  const tierLabel = filters.tier ? TIER_LABELS[filters.tier] : "All tiers";
  const trustLabel = filters.verified ? "ID Verified only" : "Open index";
  const activeCount = [
    filters.keyword,
    filters.city,
    activeObjective.id !== "all" ? activeObjective.id : "",
    filters.session,
    filters.tier,
    filters.verified ? "verified" : "",
    filters.availableToday ? "available" : "",
    filters.masterOnly ? "master" : "",
    filters.lgbtqAffirming ? "lgbtq" : "",
  ].filter(Boolean).length;

  return (
    <div className="sticky top-[86px] z-40">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[rgba(255,255,255,0.82)] shadow-[0_24px_64px_rgba(15,23,42,0.1)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.06),transparent_34%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.86))]" />

        <div className="relative px-4 py-4 md:px-6 md:py-5">
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex min-w-max items-stretch gap-3">
              <div className="flex min-w-[300px] flex-1 items-center gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/76 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl md:min-w-[440px]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                    Search Vector
                  </p>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(event) => onChange({ keyword: event.target.value })}
                    placeholder="Specialty, therapist name, or pain point"
                    className="mt-1 w-full border-none bg-transparent p-0 font-sans text-sm font-medium text-slate-950 outline-none placeholder:font-light placeholder:text-slate-400 focus:ring-0 md:text-base"
                  />
                </div>
              </div>

              <div className="hidden min-w-[190px] items-center gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/72 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:flex">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 truncate font-sans text-sm font-medium text-slate-900">{cityLabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="inline-flex min-w-[172px] items-center justify-between gap-3 rounded-[1.35rem] border border-slate-900 bg-slate-950 px-4 py-3 text-left text-white shadow-[0_20px_44px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4" />
                  <div>
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                      Control
                    </p>
                    <p className="mt-1 font-sans text-sm font-medium">
                      {isExpanded ? "Close Parameters" : "Open Parameters"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-white/16 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                  {activeCount}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto scrollbar-none">
            <div className="flex min-w-max gap-3">
              <FilterMetric label="Objective" value={activeObjective.label} />
              <FilterMetric label="Session" value={sessionLabel} compact />
              <FilterMetric label="Tier" value={tierLabel} compact />
              <FilterMetric label="Trust" value={trustLabel} compact />
              {filters.availableToday ? <FilterMetric label="Availability" value="Today" compact /> : null}
              {filters.masterOnly ? <FilterMetric label="Experience" value="10+ Years" compact /> : null}
              {filters.lgbtqAffirming ? <FilterMetric label="Inclusivity" value="LGBTQ+" compact /> : null}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: PANEL_EASE }}
              className="relative overflow-hidden border-t border-slate-200/80"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.82),rgba(255,255,255,0.94))]" />
              <div className="relative grid gap-8 px-4 py-6 md:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] md:px-6 md:py-7">
                <div className="space-y-7">
                  <div>
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                      Treatment Objective
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {DIRECTORY_OBJECTIVES.map((objective) => {
                        const isActive = activeObjective.id === objective.id;
                        return (
                          <button
                            key={objective.id}
                            type="button"
                            onClick={() =>
                              onChange({
                                goal: objective.id === "all" ? "" : objective.id,
                                modality: objective.searchValue,
                              })
                            }
                            className={`px-5 py-2.5 font-sans text-sm font-medium transition-all duration-300 ${
                              isActive
                                ? "bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950"
                            }`}
                          >
                            {objective.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                        City
                      </span>
                      <select
                        value={filters.city}
                        onChange={(event) => onChange({ city: event.target.value })}
                        className="min-h-12 w-full rounded-none border border-slate-200 bg-white px-4 py-3 font-sans text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="">All cities</option>
                        {cities.slice(0, 200).map((city) => (
                          <option key={city.slug} value={city.name}>
                            {city.name}, {city.stateCode}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="space-y-2">
                      <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                        Session Format
                      </span>
                      <div className="grid min-h-12 grid-cols-3 overflow-hidden border border-slate-200 bg-white">
                        {[
                          { value: "", label: "Any" },
                          { value: "incall", label: "Studio" },
                          { value: "home-visit", label: "Outcall" },
                        ].map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => onChange({ session: option.value as DirectorySession })}
                            className={`font-sans text-sm font-medium transition-colors ${
                              filters.session === option.value
                                ? "bg-slate-950 text-white"
                                : "border-l border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 first:border-l-0"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="space-y-2">
                      <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                        Listing Tier
                      </span>
                      <select
                        value={filters.tier}
                        onChange={(event) => onChange({ tier: (event.target.value as TherapistTier | "") || "" })}
                        className="min-h-12 w-full rounded-none border border-slate-200 bg-white px-4 py-3 font-sans text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="">All tiers</option>
                        <option value="free">Access</option>
                        <option value="standard">Standard</option>
                        <option value="pro">Pro</option>
                        <option value="elite">Elite</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="border border-slate-200 bg-white/82 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                          Availability & Tier
                        </p>
                        <p className="mt-2 max-w-xs font-sans text-sm font-light leading-6 text-slate-600">
                          Reveal the higher-intent listings first without drowning the page in options.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-950"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reset
                      </button>
                    </div>

                    <div className="mt-6 space-y-4">
                      <FilterToggle
                        label="Available Today"
                        checked={filters.availableToday}
                        onChange={(checked) => onChange({ availableToday: checked })}
                      />
                      <div className="h-px bg-slate-100" />
                      <FilterToggle
                        label="Master Level (10+ Yrs Exp)"
                        checked={filters.masterOnly}
                        onChange={(checked) => onChange({ masterOnly: checked })}
                      />
                      <div className="h-px bg-slate-100" />
                      <FilterToggle
                        label="ID Verified Only"
                        checked={filters.verified}
                        onChange={(checked) => onChange({ verified: checked })}
                      />
                      <div className="h-px bg-slate-100" />
                      <FilterToggle
                        label="LGBTQ+ Affirming"
                        checked={filters.lgbtqAffirming}
                        onChange={(checked) => onChange({ lgbtqAffirming: checked })}
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_54px_rgba(15,23,42,0.18)]">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                      Match State
                    </p>
                    <p className="mt-4 font-display text-4xl font-medium tracking-[-0.04em] text-white">
                      {resultCount}
                    </p>
                    <p className="mt-2 font-sans text-sm font-light text-slate-300">
                      {resultCount === 1 ? "listing" : "listings"} matching now.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                        {isPending ? "Refreshing query" : "URL synced"}
                      </span>
                      <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                        {totalCount} indexed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
