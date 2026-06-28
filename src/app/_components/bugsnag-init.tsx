"use client";

import Bugsnag from "@bugsnag/js";
import BugsnagPerformance from "@bugsnag/browser-performance";
import { useEffect } from "react";

const BUGSNAG_API_KEY = "8c335db3e2a7da6cf2ce12367eb0c313";

let started = false;

export function BugsnagInit() {
  useEffect(() => {
    if (started) return;
    started = true;
    Bugsnag.start({ apiKey: BUGSNAG_API_KEY });
    BugsnagPerformance.start({ apiKey: BUGSNAG_API_KEY });
  }, []);

  return null;
}
