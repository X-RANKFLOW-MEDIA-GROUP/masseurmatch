"use client";

import { useEffect } from "react";
import { requestJson } from "@/app/_lib/request";

type VerificationResponse = {
  identity?: { status?: string };
};

function normalizeStatus(value: string | undefined) {
  return (value || "not_started").trim().toLowerCase();
}

function applyIdentityStatus(statusValue: string | undefined): boolean {
  const status = normalizeStatus(statusValue);
  const verified = status === "verified";
  const headings = Array.from(document.querySelectorAll("h3"));
  const heading = headings.find((element) => element.textContent?.trim() === "Trust Signals");
  const section = heading?.closest("section");
  if (!section) return false;

  const chips = Array.from(section.querySelectorAll("span"));
  const chip = chips.find(
    (element) =>
      element.textContent?.includes("ID Verified") ||
      element.hasAttribute("data-canonical-identity-status"),
  );
  if (!chip) return false;

  const expectedText = verified
    ? "ID Verified: verified"
    : `ID Verified: ${status.replace(/_/g, " ")}`;
  const expectedClass = verified
    ? "inline-flex items-center gap-1.5 rounded-full bg-[#EDF7EF] px-3 py-2 text-xs font-semibold text-[#347348]"
    : "inline-flex items-center gap-1.5 rounded-full bg-[#FFF4E5] px-3 py-2 text-xs font-semibold text-[#986116]";

  if (
    chip.getAttribute("data-canonical-identity-status") !== status ||
    chip.textContent !== expectedText ||
    chip.className !== expectedClass
  ) {
    chip.textContent = expectedText;
    chip.className = expectedClass;
    chip.setAttribute("data-canonical-identity-status", status);
  }

  return true;
}

export function TrustStatusEnhancer() {
  useEffect(() => {
    let cancelled = false;
    let canonicalStatus = "not_started";

    const observer = new MutationObserver(() => {
      if (!cancelled) applyIdentityStatus(canonicalStatus);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    requestJson<VerificationResponse>("/api/provider/verification")
      .then((data) => {
        if (cancelled) return;
        canonicalStatus = normalizeStatus(data.identity?.status);
        applyIdentityStatus(canonicalStatus);
      })
      .catch(() => {
        if (cancelled) return;
        canonicalStatus = "not_started";
        applyIdentityStatus(canonicalStatus);
      });

    applyIdentityStatus(canonicalStatus);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
