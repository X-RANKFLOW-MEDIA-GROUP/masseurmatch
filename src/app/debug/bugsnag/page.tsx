"use client";

import { useState } from "react";

import { notifyBugsnag } from "@/lib/bugsnag";

export default function BugsnagDebugPage() {
  const [status, setStatus] = useState<"idle" | "sent" | "missing-key">("idle");
  const isEnabled = Boolean(process.env.NEXT_PUBLIC_BUGSNAG_API_KEY);

  function sendTestError() {
    if (!isEnabled) {
      setStatus("missing-key");
      return;
    }

    notifyBugsnag(new Error("Test error"));
    setStatus("sent");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#8B1E2D]">MasseurMatch Debug</p>
      <h1 className="text-4xl font-semibold text-[#111111]">Bugsnag test</h1>
      <p className="mt-4 text-base leading-7 text-[#6F6F6F]">
        Use this page after deployment to send one manual test error to Bugsnag and confirm the integration is active.
      </p>

      <button
        type="button"
        onClick={sendTestError}
        className="mt-8 rounded-full bg-[#111111] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#333333]"
      >
        Send Bugsnag test error
      </button>

      {status === "sent" ? (
        <p className="mt-4 text-sm text-[#1E7A46]">Test error sent. Refresh your Bugsnag Inbox.</p>
      ) : null}

      {status === "missing-key" ? (
        <p className="mt-4 text-sm text-[#DC2626]">
          Missing NEXT_PUBLIC_BUGSNAG_API_KEY. Add it in Vercel and redeploy before testing.
        </p>
      ) : null}
    </main>
  );
}
