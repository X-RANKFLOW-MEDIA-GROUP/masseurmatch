"use client";

import { useEffect } from "react";
import { requestJson } from "@/app/_lib/request";

type AnalyticsResponse = {
  isLive: boolean;
  totals: { windowViews: number };
};

function updateMetric(data: AnalyticsResponse) {
  const labels = Array.from(document.querySelectorAll("div, span"));
  const label = labels.find((element) => element.textContent?.trim() === "Profile Views");
  const card = label?.parentElement;
  if (!card) return;

  const value = card.querySelector(".font-display");
  const notes = Array.from(card.querySelectorAll("div")).filter((element) => element !== value && element !== label);
  const note = notes.at(-1);

  if (value) value.textContent = data.totals.windowViews.toLocaleString("en-US");
  if (note) {
    note.textContent = data.isLive
      ? "Last 30 days"
      : "Tracking starts when your listing goes live.";
  }
}

export function DashboardAnalyticsEnhancer() {
  useEffect(() => {
    let cancelled = false;
    requestJson<AnalyticsResponse>("/api/pro/analytics")
      .then((data) => {
        if (!cancelled) updateMetric(data);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
