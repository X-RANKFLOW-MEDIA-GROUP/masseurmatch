"use client";

import { useEffect, useState } from "react";

export default function VerificationPage() {
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/stripe/identity/status");
        const data = await res.json();

        setStatus(data.status || "unknown");
      } catch {
        setStatus("error");
      }
    }

    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4">Verification Status</h1>

      {status === "loading" && <p>Checking verification...</p>}

      {status === "pending" && (
        <p>Your verification is being reviewed. This usually takes a few minutes.</p>
      )}

      {status === "verified" && (
        <p className="text-green-600">You are verified. Your profile is now trusted.</p>
      )}

      {status === "requires_input" && (
        <p className="text-yellow-600">More information is required. Please retry verification.</p>
      )}

      {status === "canceled" && (
        <p className="text-red-600">Verification was canceled. Please start again.</p>
      )}

      {status === "error" && (
        <p className="text-red-600">Could not load verification status.</p>
      )}

      {status === "unknown" && (
        <p>No verification found. Start your verification from the dashboard.</p>
      )}
    </div>
  );
}
