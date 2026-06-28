"use client";

import Bugsnag from "@bugsnag/js";
import BugsnagPerformance from "@bugsnag/browser-performance";

let hasStarted = false;

function getReleaseStage() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV) return process.env.NEXT_PUBLIC_VERCEL_ENV;
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function startBugsnag() {
  if (hasStarted || typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_BUGSNAG_API_KEY;

  if (!apiKey) return;

  const releaseStage = getReleaseStage();
  const appVersion = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

  Bugsnag.start({
    apiKey,
    appType: "browser",
    appVersion,
    releaseStage,
    enabledReleaseStages: ["production", "preview"],
  });

  BugsnagPerformance.start({
    apiKey,
    appVersion,
    releaseStage,
    enabledReleaseStages: ["production", "preview"],
  });

  hasStarted = true;
}

export function notifyBugsnag(error: Error) {
  if (!hasStarted) startBugsnag();
  Bugsnag.notify(error);
}
