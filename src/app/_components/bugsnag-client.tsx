"use client";

import { useEffect } from "react";

import { startBugsnag } from "@/lib/bugsnag";

export function BugsnagClient() {
  useEffect(() => {
    startBugsnag();
  }, []);

  return null;
}
