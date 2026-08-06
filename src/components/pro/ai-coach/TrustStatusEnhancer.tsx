"use client";

import { useEffect } from "react";
import { requestJson } from "@/app/_lib/request";

type VerificationResponse = {
  identity?: { status?: string };
};

function applyIdentityStatus(statusValue: string | undefined) {
  const status = (statusValue || "not_started").trim().toLowerCase();
  const verified = status === "verified";
  const headings = Array.from(document.querySelectorAll("h3"));
  const heading = headings.find((element) => element.textContent?.trim() === "Trust Signals");
  const section = heading?.closest("section");
  if (!section) return;

  const chips = Array.from(section.querySelectorAll("span"));
  const chip = chips.find((element) => element.textContent?.includes("ID Verified"));
  if (!chip) return;

  chip.textContent = verified ? "ID Verified: verified" : `ID Verified: ${status.replace(/_/g, " ")}`;
  chip.className = verified
    ? "inline-flex items-center gap-1.5 rounded-full bg-[#EDF7EF] px-3 py-2 text-xs font-semibold text-[#347348]"
    : "inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E5] px-3 py-2 text-xs font-semibold text-[#986116]";
  chip.setAttribute("data-canonical-identity-status", status);
}

export function TrustStatusEnhancer() {
  useEffect(() => {
    let cancelled = false;

    requestJson<VerificationResponse>("/api/provider/verification")
      .then((data) => {
        if (!cancelled) applyIdentityStatus(data.identity?.status);
      })
      .catch(() => {
        if (!cancelled) applyIdentityStatus("not_started");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
