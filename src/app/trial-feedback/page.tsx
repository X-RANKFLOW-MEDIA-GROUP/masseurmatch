"use client";

import { FormEvent, useEffect, useState } from "react";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#b56b43] focus:ring-2 focus:ring-[#b56b43]/20";

export default function TrialFeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [contactRequested, setContactRequested] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFirstName(params.get("first_name") || "");
    setEmail(params.get("email") || "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch("/api/trial-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to submit feedback.");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit your feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f4f1ec] px-4 py-16">
        <section className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl shadow-slate-900/5">
          <h1 className="text-3xl font-bold text-slate-950">Thank you for your feedback</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Your confidential response was securely received by the MasseurMatch team.
          </p>
          <a
            href="https://masseurmatch.com"
            className="mt-8 inline-block rounded-full bg-[#b56b43] px-7 py-4 font-semibold text-white"
          >
            Return to MasseurMatch
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] px-4 py-8 sm:py-12">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/10">
        <img
          src="https://res.cloudinary.com/dyfxkq2nk/image/upload/v1785018479/Fundo_para_combinar_com_a_logo_fd1lue.png"
          alt="MasseurMatch"
          className="block h-auto w-full"
        />
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
            MasseurMatch Trial Feedback
          </h1>
          <div className="mt-5 rounded-xl border-l-4 border-[#b56b43] bg-[#f8f2ea] p-4 text-sm leading-6 text-slate-700">
            <strong className="text-slate-950">Your answers are confidential.</strong> They are
            stored securely and reviewed only by the MasseurMatch team. We will not publish an
            individual response without permission.
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <Field label="First name">
              <input
                name="first_name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                maxLength={80}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                className={inputClass}
              />
            </Field>
            <Field label="Overall, how would you rate your trial?">
              <Select
                name="overall_rating"
                options={["Excellent", "Good", "Average", "Poor", "Very poor"]}
              />
            </Field>
            <Field label="How easy was it to create and update your profile?">
              <Select
                name="profile_experience"
                options={["Very easy", "Easy", "Neutral", "Difficult", "Very difficult"]}
              />
            </Field>
            <Field label="Which parts were most useful?">
              <textarea
                name="most_useful"
                rows={4}
                required
                maxLength={3000}
                className={inputClass}
                placeholder="Profile tools, city visibility, photos, SEO, support, etc."
              />
            </Field>
            <Field label="What was confusing, difficult, or missing?">
              <textarea
                name="problems_or_missing"
                rows={4}
                maxLength={3000}
                className={inputClass}
              />
            </Field>
            <Field label="Did you understand how cities and profile updates help visibility?">
              <Select
                name="seo_understanding"
                options={["Yes, clearly", "Somewhat", "No"]}
              />
            </Field>
            <Field label="How likely are you to continue using MasseurMatch?">
              <Select
                name="continue_likelihood"
                options={["Very likely", "Likely", "Not sure", "Unlikely", "Very unlikely"]}
              />
            </Field>
            <Field label="What would make MasseurMatch more valuable to you?">
              <textarea
                name="improvement_request"
                rows={4}
                maxLength={3000}
                className={inputClass}
              />
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-slate-800">
              <input
                type="checkbox"
                name="contact_requested"
                value="yes"
                checked={contactRequested}
                onChange={(event) => setContactRequested(event.target.checked)}
                className="mt-1 h-5 w-5 accent-[#b56b43]"
              />
              <span>
                <strong>I would like a private follow-up.</strong>
                <br />
                <span className="text-sm text-slate-600">
                  A team member may contact me using the method and time I provide.
                </span>
              </span>
            </label>

            {contactRequested && (
              <div className="space-y-5 rounded-2xl bg-[#f8f2ea] p-5">
                <Field label="Preferred contact method">
                  <Select
                    name="preferred_contact_method"
                    options={["Text message", "Chat", "Phone call"]}
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={40}
                    className={inputClass}
                    placeholder="Include area code"
                  />
                </Field>
                <Field label="Best time to contact you">
                  <input
                    name="best_contact_time"
                    required
                    maxLength={160}
                    className={inputClass}
                    placeholder="Example: Weekdays after 5 PM Central"
                  />
                </Field>
              </div>
            )}

            <Field label="Anything else you would like us to know?">
              <textarea
                name="additional_comments"
                rows={4}
                maxLength={3000}
                className={inputClass}
              />
            </Field>
            <input type="hidden" name="confidentiality_acknowledged" value="yes" />

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#b56b43] px-6 py-4 text-base font-bold text-white transition hover:bg-[#9d5b38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Submit Confidential Feedback"}
            </button>
          </form>
        </div>
        <img
          src="https://res.cloudinary.com/dyfxkq2nk/image/upload/v1784867739/D3742A68-94AC-4609-88D9-10231F48641B_yhbyws.png"
          alt="MasseurMatch footer"
          className="block h-auto w-full"
        />
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block font-semibold text-slate-800">
      {label}
      {children}
    </label>
  );
}

function Select({ name, options }: { name: string; options: string[] }) {
  return (
    <select name={name} required defaultValue="" className={inputClass}>
      <option value="" disabled>
        Select one
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
