"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type HomeCity = {
  slug: string;
  name: string;
  stateCode: string;
};

type HomeSmartMatchCardProps = {
  cities: HomeCity[];
  featuredModalities: string[];
  therapistCount: number;
};

type GeoResponse = {
  ok: boolean;
  city?: string | null;
  stateCode?: string | null;
  error?: string;
};

function normalizeLocationLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trackHomeEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const entry = {
    event,
    page: "home",
    ts: Date.now(),
    ...payload,
  };

  const analyticsWindow = window as typeof window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push(entry);
  window.dispatchEvent(new CustomEvent("mm:analytics", { detail: entry }));

  const body = JSON.stringify(entry);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

const STORAGE_KEY = "mm:smart_match";

export function HomeSmartMatchCard({ cities, featuredModalities, therapistCount }: HomeSmartMatchCardProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [city, setCity] = useState("");
  const [modality, setModality] = useState("");
  const [session, setSession] = useState("");
  const [goal, setGoal] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  const hasSelections = useMemo(() => Boolean(city || modality || session || goal), [city, modality, session, goal]);

  useEffect(() => {
    const formElement = formRef.current;
    if (!formElement || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateSticky = (isVisible: boolean) => {
      setShowStickyCta(mediaQuery.matches && !isVisible);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        updateSticky(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(formElement);

    const handleMediaChange = () => {
      const rect = formElement.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
      updateSticky(isVisible);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    handleMediaChange();

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Restore last selections from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<{ city: string; modality: string; session: string; goal: string }>;
      let restored = false;
      if (parsed.city && cities.some((c) => c.name === parsed.city)) {
        setCity(parsed.city);
        restored = true;
      }
      if (parsed.modality) { setModality(parsed.modality); restored = true; }
      if (parsed.session) { setSession(parsed.session); restored = true; }
      if (parsed.goal) { setGoal(parsed.goal); restored = true; }
      if (restored) {
        setRestoredFromStorage(true);
        trackHomeEvent("smart_match_restored_from_storage", {
          city: parsed.city ?? "",
          modality: parsed.modality ?? "",
          session: parsed.session ?? "",
          goal: parsed.goal ?? "",
        });
      }
    } catch {
      // ignore parse or storage errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, modality, session, goal }));
    } catch {
      // ignore quota or security errors
    }
  }, [city, modality, session, goal]);

  const submitSearch = () => {
    const params = new URLSearchParams();

    if (city) {
      params.set("city", city);
    }

    if (modality) {
      params.set("modality", modality);
    }

    if (session) {
      params.set("session", session);
    }

    if (goal) {
      params.set("goal", goal);
    }

    params.set("source", "home-hero");

    trackHomeEvent("smart_match_submit", {
      city,
      modality,
      session,
      goal,
      hasSelections,
    });

    router.push(`/search?${params.toString()}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const handleStickyClick = () => {
    trackHomeEvent("smart_match_sticky_click", { hasSelections });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstField = formRef.current.querySelector("select");
      if (firstField instanceof HTMLElement) {
        window.setTimeout(() => firstField.focus(), 250);
      }
      return;
    }

    submitSearch();
  };

  const handleUseLocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNote("Location is not available in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationNote("Checking your nearest city...");
    trackHomeEvent("smart_match_geo_request");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
            { cache: "no-store" },
          );

          const payload = (await response.json()) as GeoResponse;
          const normalizedCity = normalizeLocationLabel(payload.city || "");
          const matchedCity = cities.find((item) => {
            const normalizedName = normalizeLocationLabel(item.name);
            const stateMatches = !payload.stateCode || item.stateCode === payload.stateCode;

            return stateMatches && (normalizedName === normalizedCity || normalizedName.includes(normalizedCity) || normalizedCity.includes(normalizedName));
          });

          if (!matchedCity) {
            setLocationNote("We found your location, but not a matching supported city yet.");
            trackHomeEvent("smart_match_geo_no_match", {
              city: payload.city || null,
              stateCode: payload.stateCode || null,
            });
            return;
          }

          setCity(matchedCity.name);
          setLocationNote(`Using ${matchedCity.name}, ${matchedCity.stateCode}.`);
          trackHomeEvent("smart_match_geo_success", {
            city: matchedCity.name,
            stateCode: matchedCity.stateCode,
          });
        } catch {
          setLocationNote("We could not resolve your city right now.");
          trackHomeEvent("smart_match_geo_error");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationNote("Location permission was denied.");
        trackHomeEvent("smart_match_geo_denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  };

  return (
    <>
      <div className="brand-surface rounded-[28px] p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-muted-foreground">Smart Match Quiz</p>
            <h2 className="mt-2 font-display text-[1.9rem] leading-tight text-foreground">Find My Therapist In 4 Prompts</h2>
            <p className="mt-2.5 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Quiz-first flow: answer four quick prompts and land on a narrower, higher-intent therapist list.
            </p>
          </div>
          <div className="hidden rounded-full border border-brand-gold/30 bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-text-primary sm:inline-flex">
            Most visitors start here
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 grid gap-3" id="smart-match-form">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <select
                name="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">1. City, zip, or use GPS</option>
                {cities.map((item) => (
                  <option key={item.slug} value={item.name}>
                    {item.name}, {item.stateCode}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={isLocating}
                className="inline-flex w-fit items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/20 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLocating ? "Finding nearest city..." : "Use my location"}
              </button>
              {locationNote ? <p className="text-xs text-muted-foreground">{locationNote}</p> : null}
            </div>

            <select
              name="modality"
              value={modality}
              onChange={(event) => setModality(event.target.value)}
              className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">2. Preferred massage type</option>
              {featuredModalities.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/-/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="session"
              value={session}
              onChange={(event) => setSession(event.target.value)}
              className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">3. Session style</option>
              <option value="relaxing">Relaxing</option>
              <option value="therapeutic">Therapeutic / deep tissue</option>
              <option value="sports">Sports recovery</option>
              <option value="mix">Balanced mix</option>
            </select>

            <select
              name="goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              className="w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">4. Primary goal</option>
              <option value="pain-relief">Pain relief</option>
              <option value="stress-reset">Stress reset</option>
              <option value="performance">Performance and mobility</option>
              <option value="general-wellness">General wellness</option>
            </select>
          </div>

          <div className="grid gap-2">
            {restoredFromStorage ? (
              <p className="text-xs text-muted-foreground">
                Last search restored.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => {
                    setCity("");
                    setModality("");
                    setSession("");
                    setGoal("");
                    setRestoredFromStorage(false);
                    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
                  }}
                >
                  Clear
                </button>
              </p>
            ) : null}
            <Button
              type="submit"
              onClick={() => trackHomeEvent("smart_match_primary_cta_click", { hasSelections })}
              className="h-auto rounded-full px-5 py-3.5"
            >
              Start Smart Match
            </Button>
          </div>
        </form>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Verified Profiles</p>
            <p className="mt-1 font-display text-2xl leading-none text-foreground">{therapistCount}+</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Live Cities</p>
            <p className="mt-1 font-display text-2xl leading-none text-foreground">{cities.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Avg Match Setup</p>
            <p className="mt-1 font-display text-2xl leading-none text-foreground">&lt; 60s</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {["Gay-Friendly", "Direct Contact", "No Marketplace Fees"].map((label) => (
            <span key={label} className="rounded-full border border-border bg-white px-3 py-2 text-[11px] text-foreground">
              {label}
            </span>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Prefer manual browsing? <Link href="/therapists" className="font-semibold text-foreground underline underline-offset-4">Open full directory</Link>.
        </p>
      </div>

      {showStickyCta ? (
        <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
          <button
            type="button"
            onClick={handleStickyClick}
            className="flex w-full items-center justify-center rounded-full bg-action-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(204,36,36,0.28)]"
          >
            {hasSelections ? "Continue Smart Match" : "Start Smart Match"}
          </button>
        </div>
      ) : null}
    </>
  );
}
