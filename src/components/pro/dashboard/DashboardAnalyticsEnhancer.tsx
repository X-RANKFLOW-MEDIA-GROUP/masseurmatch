"use client";

import { useEffect } from "react";
import { requestJson } from "@/app/_lib/request";

type AnalyticsResponse = {
  isLive: boolean;
  totals: { windowViews: number };
};

type DashboardProfileResponse = {
  profile: {
    display_name: string | null;
    full_name: string | null;
  } | null;
};

function updateMetric(data: AnalyticsResponse): boolean {
  const labels = Array.from(document.querySelectorAll("div, span"));
  const label = labels.find((element) => element.textContent?.trim() === "Profile Views");
  const card = label?.parentElement;
  if (!card) return false;

  const value = card.querySelector<HTMLElement>(".font-display");
  const notes = Array.from(card.querySelectorAll<HTMLElement>("div")).filter(
    (element) => element !== value && element !== label,
  );
  const note = notes.at(-1);
  const expectedValue = data.totals.windowViews.toLocaleString("en-US");
  const expectedNote = data.isLive
    ? "Last 30 days"
    : "Tracking starts when your listing goes live.";

  if (value && value.textContent !== expectedValue) value.textContent = expectedValue;
  if (note && note.textContent !== expectedNote) note.textContent = expectedNote;
  card.setAttribute("data-canonical-profile-views", String(data.totals.windowViews));
  return Boolean(value && note);
}

function updateProfileName(data: DashboardProfileResponse): boolean {
  const name = data.profile?.display_name?.trim() || data.profile?.full_name?.trim();
  if (!name) return false;

  const expectedName = name.split(" ")[0].slice(0, 20);
  const completionLabel = Array.from(document.querySelectorAll("span")).find(
    (element) => element.textContent?.trim().toLowerCase() === "profile completion",
  );
  const profileCard = completionLabel?.closest<HTMLElement>("div.relative");
  const heading = profileCard?.querySelector<HTMLElement>("h2");
  if (!heading || !profileCard) return false;

  if (heading.textContent !== expectedName) heading.textContent = expectedName;
  profileCard.setAttribute("data-canonical-profile-name", expectedName);
  return true;
}

export function DashboardAnalyticsEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let analytics: AnalyticsResponse | null = null;
    let profile: DashboardProfileResponse | null = null;

    const apply = () => {
      if (cancelled) return;
      if (analytics) updateMetric(analytics);
      if (profile) updateProfileName(profile);
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    Promise.all([
      requestJson<AnalyticsResponse>("/api/pro/analytics"),
      requestJson<DashboardProfileResponse>("/api/pro/profile?dashboard=true"),
    ])
      .then(([analyticsResponse, profileResponse]) => {
        if (cancelled) return;
        analytics = analyticsResponse;
        profile = profileResponse;
        apply();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
