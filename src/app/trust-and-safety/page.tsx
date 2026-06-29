import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust & Safety | MasseurMatch",
  description: "Trust and safety guidance for MasseurMatch, a directory for discovering independent massage therapists.",
};

export default function TrustAndSafetyPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] px-6 py-28 text-[#111111]">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="font-sans text-xs uppercase tracking-[0.22em] text-[#8B1E2D]">Back to MasseurMatch</Link>
        <h1 className="mt-8 font-['Georgia','Times_New_Roman',serif] text-5xl font-normal tracking-[-0.04em] md:text-7xl">Trust & Safety</h1>
        <p className="mt-6 font-sans text-lg leading-8 text-slate-600">
          MasseurMatch is a discovery directory. We help users find independent massage therapists and review profile information. MasseurMatch does not manage bookings, payments, calendars, sessions, reviews, or therapist license verification.
        </p>
        <div className="mt-12 grid gap-6">
          <section className="border border-slate-200 bg-white p-6">
            <h2 className="font-['Georgia','Times_New_Roman',serif] text-2xl">Direct contact model</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Clients contact therapists directly outside the platform to discuss availability, rates, boundaries, location, and session details.</p>
          </section>
          <section className="border border-slate-200 bg-white p-6">
            <h2 className="font-['Georgia','Times_New_Roman',serif] text-2xl">User responsibility</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Users should verify identity, credentials, policies, and expectations directly with the therapist before scheduling any service.</p>
          </section>
          <section className="border border-slate-200 bg-white p-6">
            <h2 className="font-['Georgia','Times_New_Roman',serif] text-2xl">Report concerns</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">For general support, contact support@masseurmatch.com. For legal matters, contact legal@masseurmatch.com.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
