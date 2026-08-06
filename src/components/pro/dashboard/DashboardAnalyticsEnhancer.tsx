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

function updateMetric(data: AnalyticsResponse) {
  const labels = Array.from(document.querySelectorAll("div, span"));
  const label = labels.find((element) => element.textContent?.trim() === "Profile Views");
  const card = label?.parentElement;
  if (!card) return;

  const value = card.querySelector(".font-display");
  const notes = Array.from(card.querySelectorAll("div")).filter(
    (element) => element !== value && element !== label,
  );
  const note = notes.at(-1);

  if (value) value.textContent = data.totals.windowViews.toLocaleString("en-US");
  if (note) {
    note.textContent = data.isLive
      ? "Last 30 days"
      : "Tracking starts when your listing goes live.";
  }
}

function updateProfileName(data: DashboardProfileResponse) {
  const name = data.profile?.display_name?.trim() || data.profile?.full_name?.trim();
  if (!name) return;

  const completionLabel = Array.from(document.querySelectorAll("span")).find(
    (element) => element.textContent?.trim().toLowerCase() === "profile completion",
  );
  const profileCard = completionLabel?.closest("div.relative");
  const heading = profileCard?.querySelector("h2");

  if (heading) heading.textContent = name.split(" ")[0].slice(0, 20);
}

export function DashboardAnalyticsEnhancer() {
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      requestJson<AnalyticsResponse>("/api/pro/analytics"),
      requestJson<DashboardProfileResponse>("/api/pro/profile?dashboard=true"),
    ])
      .then(([analytics, profile]) => {
        if (cancelled) return;
        updateMetric(analytics);
        updateProfileName(profile);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
