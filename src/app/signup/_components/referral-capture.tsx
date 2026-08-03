"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralCapture() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  useEffect(() => {
    if (!referralCode) return;

    fetch("/api/referrals/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode }),
      keepalive: true,
    }).catch(() => null);
  }, [referralCode]);

  return null;
}
