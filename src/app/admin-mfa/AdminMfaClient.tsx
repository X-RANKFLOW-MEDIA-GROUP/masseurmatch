"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/integrations/supabase/client";

type Mode = "loading" | "enroll" | "challenge" | "done";

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

function safeAdminRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }
  return value;
}

export default function AdminMfaClient({ redirectTo }: { redirectTo?: string | null }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const destination = safeAdminRedirect(redirectTo);

  const [mode, setMode] = useState<Mode>("loading");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setError(null);

      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;

      if (assurance.currentLevel === "aal2") {
        if (!cancelled) {
          setMode("done");
          router.replace(destination);
          router.refresh();
        }
        return;
      }

      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verified = factors.totp.find((factor) => factor.status === "verified");
      if (verified) {
        if (!cancelled) {
          setFactorId(verified.id);
          setMode("challenge");
        }
        return;
      }

      // Discard incomplete native enrollments before creating a fresh QR code.
      // No verified factor is removed here.
      for (const factor of factors.totp.filter((candidate) => candidate.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id }).catch(() => undefined);
      }

      const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "MasseurMatch Admin",
      });
      if (enrollError) throw enrollError;

      if (!cancelled) {
        setEnrollment({
          factorId: enrolled.id,
          qrCode: enrolled.totp.qr_code,
          secret: enrolled.totp.secret,
        });
        setFactorId(enrolled.id);
        setMode("enroll");
      }
    }

    initialize().catch((cause: unknown) => {
      if (!cancelled) {
        setError(cause instanceof Error ? cause.message : "Could not initialize MFA.");
        setMode("enroll");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [destination, router, supabase]);

  async function verify() {
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError("Enter the 6 digit code from your authenticator app.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;

      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (assurance.currentLevel !== "aal2") {
        throw new Error("MFA verification did not elevate the session to AAL2.");
      }

      setMode("done");
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "MFA verification failed.");
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading" || mode === "done") {
    return (
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">Checking admin security…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Admin security
        </p>
        <h1 className="text-2xl font-semibold text-slate-950">
          {mode === "enroll" ? "Set up two factor authentication" : "Verify your second factor"}
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          {mode === "enroll"
            ? "Scan the QR code with an authenticator app, then enter the current 6 digit code."
            : "Enter the current 6 digit code from the authenticator app linked to this admin account."}
        </p>
      </div>

      {mode === "enroll" && enrollment ? (
        <div className="mt-6 space-y-4">
          {/* Supabase returns a self-contained SVG data URL for native TOTP enrollment. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrollment.qrCode}
            alt="Authenticator QR code"
            className="mx-auto h-56 w-56 rounded-xl border bg-white p-3"
          />
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Manual setup key</p>
            <code className="mt-2 block break-all text-sm text-slate-900">{enrollment.secret}</code>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        <label htmlFor="mfa-code" className="block text-sm font-medium text-slate-800">
          Authentication code
        </label>
        <input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !busy) void verify();
          }}
          className="w-full rounded-xl border px-4 py-3 text-lg tracking-[0.35em] outline-none focus:ring-2 focus:ring-slate-900"
          aria-describedby={error ? "mfa-error" : undefined}
        />

        {error ? (
          <p id="mfa-error" role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void verify()}
          disabled={busy || code.length !== 6 || !factorId}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Verifying…" : mode === "enroll" ? "Enable MFA" : "Verify and continue"}
        </button>
      </div>
    </div>
  );
}
