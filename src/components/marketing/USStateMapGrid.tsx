"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, ChevronRight, X } from "lucide-react";
import { US_CITIES } from "@/data/cities";

type StateTile = {
  code: string;
  name: string;
  col: number;
  row: number;
};

// Standard US tile cartogram — 12 cols × 8 rows (0-indexed)
const STATES: StateTile[] = [
  // Row 0
  { code: "AK", name: "Alaska",          col:  0, row: 0 },
  { code: "ME", name: "Maine",           col: 11, row: 0 },
  // Row 1
  { code: "NH", name: "New Hampshire",   col: 10, row: 1 },
  { code: "VT", name: "Vermont",         col: 11, row: 1 },
  // Row 2
  { code: "WA", name: "Washington",      col:  0, row: 2 },
  { code: "MT", name: "Montana",         col:  2, row: 2 },
  { code: "ND", name: "North Dakota",    col:  3, row: 2 },
  { code: "MN", name: "Minnesota",       col:  4, row: 2 },
  { code: "WI", name: "Wisconsin",       col:  5, row: 2 },
  { code: "MI", name: "Michigan",        col:  6, row: 2 },
  { code: "NY", name: "New York",        col:  9, row: 2 },
  { code: "MA", name: "Massachusetts",   col: 10, row: 2 },
  { code: "RI", name: "Rhode Island",    col: 11, row: 2 },
  // Row 3
  { code: "OR", name: "Oregon",          col:  0, row: 3 },
  { code: "ID", name: "Idaho",           col:  1, row: 3 },
  { code: "WY", name: "Wyoming",         col:  2, row: 3 },
  { code: "SD", name: "South Dakota",    col:  3, row: 3 },
  { code: "IA", name: "Iowa",            col:  4, row: 3 },
  { code: "IL", name: "Illinois",        col:  5, row: 3 },
  { code: "IN", name: "Indiana",         col:  6, row: 3 },
  { code: "OH", name: "Ohio",            col:  7, row: 3 },
  { code: "PA", name: "Pennsylvania",    col:  8, row: 3 },
  { code: "NJ", name: "New Jersey",      col:  9, row: 3 },
  { code: "CT", name: "Connecticut",     col: 10, row: 3 },
  // Row 4
  { code: "CA", name: "California",      col:  0, row: 4 },
  { code: "NV", name: "Nevada",          col:  1, row: 4 },
  { code: "CO", name: "Colorado",        col:  2, row: 4 },
  { code: "NE", name: "Nebraska",        col:  3, row: 4 },
  { code: "MO", name: "Missouri",        col:  4, row: 4 },
  { code: "KY", name: "Kentucky",        col:  5, row: 4 },
  { code: "WV", name: "West Virginia",   col:  6, row: 4 },
  { code: "VA", name: "Virginia",        col:  7, row: 4 },
  { code: "MD", name: "Maryland",        col:  8, row: 4 },
  { code: "DE", name: "Delaware",        col:  9, row: 4 },
  { code: "DC", name: "Washington D.C.", col: 10, row: 4 },
  // Row 5
  { code: "AZ", name: "Arizona",         col:  1, row: 5 },
  { code: "UT", name: "Utah",            col:  2, row: 5 },
  { code: "KS", name: "Kansas",          col:  3, row: 5 },
  { code: "AR", name: "Arkansas",        col:  4, row: 5 },
  { code: "TN", name: "Tennessee",       col:  5, row: 5 },
  { code: "NC", name: "North Carolina",  col:  6, row: 5 },
  { code: "SC", name: "South Carolina",  col:  7, row: 5 },
  // Row 6
  { code: "NM", name: "New Mexico",      col:  2, row: 6 },
  { code: "OK", name: "Oklahoma",        col:  3, row: 6 },
  { code: "LA", name: "Louisiana",       col:  4, row: 6 },
  { code: "MS", name: "Mississippi",     col:  5, row: 6 },
  { code: "AL", name: "Alabama",         col:  6, row: 6 },
  { code: "GA", name: "Georgia",         col:  7, row: 6 },
  // Row 7
  { code: "HI", name: "Hawaii",          col:  0, row: 7 },
  { code: "TX", name: "Texas",           col:  3, row: 7 },
  { code: "FL", name: "Florida",         col:  5, row: 7 },
];

const COLS = 12;
const ROWS = 8;

// States that have cities in the directory
const ACTIVE_CODES = new Set(
  Array.from(new Set(US_CITIES.map((c) => c.stateCode)))
);

export function USStateMapGrid() {
  const [selected, setSelected] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const selectedState = STATES.find((s) => s.code === selected);

  const cities = useMemo(() => {
    if (!selected) return [];
    return [...US_CITIES]
      .filter((c) => c.stateCode === selected)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selected]);

  function toggle(code: string) {
    setSelected((prev) => (prev === code ? null : code));
  }

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            City Coverage
          </p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[0.95] tracking-tight">
            Find a therapist in your city.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            MasseurMatch covers every major US market. Select a state to browse
            its cities.
          </p>
        </div>

        {/* Tile grid */}
        <div
          className="w-full overflow-x-auto pb-2"
          style={{ perspective: "900px" }}
        >
          <div
            className="mx-auto"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, minmax(48px, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, 52px)`,
              gap: "5px",
              minWidth: 620,
            }}
          >
            {STATES.map((state) => {
              const isSelected = selected === state.code;
              const isActive   = ACTIVE_CODES.has(state.code);

              return (
                <motion.button
                  key={state.code}
                  onClick={() => toggle(state.code)}
                  style={{
                    gridColumn: state.col + 1,
                    gridRow:    state.row + 1,
                    transformStyle: "preserve-3d",
                    transformOrigin: "center bottom",
                  }}
                  animate={
                    isSelected
                      ? {
                          y: reduced ? 0 : -10,
                          rotateX: reduced ? 0 : -8,
                          scale: reduced ? 1 : 1.08,
                          filter:
                            "drop-shadow(0 16px 28px rgba(204,36,36,0.55))",
                          zIndex: 20,
                        }
                      : {
                          y: 0,
                          rotateX: 0,
                          scale: 1,
                          filter: "none",
                          zIndex: 1,
                        }
                  }
                  whileHover={
                    !isSelected && !reduced
                      ? {
                          y: -5,
                          rotateX: -4,
                          scale: 1.05,
                          filter:
                            "drop-shadow(0 8px 18px rgba(26,26,26,0.22))",
                        }
                      : {}
                  }
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  aria-pressed={isSelected}
                  aria-label={`${state.name} — ${isActive ? "browse cities" : "coming soon"}`}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl",
                    "border text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D] transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#8B1E2D] border-[#8B1E2D] text-white shadow-lg"
                      : isActive
                        ? "bg-white border-border text-foreground hover:border-[#8B1E2D]/50 hover:bg-red-50/50"
                        : "bg-muted/40 border-border/50 text-muted-foreground/60 cursor-default",
                  ].join(" ")}
                >
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest leading-none">
                    {state.code}
                  </span>
                  {isActive && !isSelected && (
                    <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-400/80" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            Cities available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            Coming soon
          </span>
        </div>

        {/* City panel */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-8 rounded-2xl border border-border bg-white p-6 shadow-[0_4px_32px_rgba(26,26,26,0.08)]"
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B1E2D]/10">
                  <MapPin className="h-4 w-4 text-[#8B1E2D]" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {selectedState?.code}
                  </p>
                  <h3 className="font-display text-lg font-bold leading-tight text-foreground">
                    {selectedState?.name}
                  </h3>
                </div>
                {cities.length > 0 && (
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {cities.length} {cities.length === 1 ? "city" : "cities"}
                  </span>
                )}
              </div>

              {cities.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {cities.map((city, i) => (
                    <motion.div
                      key={city.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.18 }}
                    >
                      <Link
                        href={`/${city.slug}`}
                        className="group flex items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[#8B1E2D]/25 hover:bg-red-50/60 hover:text-[#8B1E2D]"
                      >
                        <ChevronRight
                          className="h-3 w-3 shrink-0 text-[#8B1E2D]/0 transition group-hover:text-[#8B1E2D]/80"
                          strokeWidth={2.5}
                        />
                        {city.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <MapPin className="mx-auto mb-2 h-5 w-5 opacity-30" />
                  We&rsquo;re expanding to {selectedState?.name} soon. Check back shortly.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
