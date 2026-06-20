"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      style={{
        background: "#CC2424",
        color: "#FFFFFF",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(24px, 3.5vw, 38px)",
          fontWeight: 400,
          marginBottom: 14,
        }}
      >
        Stay in the loop
      </h2>
      <p
        style={{
          fontSize: 15,
          opacity: 0.7,
          marginBottom: 36,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        New articles, wellness tips, and LGBTQ+ resources - delivered monthly.
      </p>

      {status === "success" ? (
        <p style={{ fontSize: 15, color: "#FFFFFF", fontFamily: "system-ui, sans-serif" }}>
          You&apos;re subscribed. Welcome aboard.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 0, maxWidth: 460, margin: "0 auto" }}
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            aria-label="Email address for newsletter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 20px",
              fontSize: 14,
              fontFamily: "system-ui, sans-serif",
              border: "none",
              background: "rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              padding: "14px 28px",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
              background: "#CC2424",
              color: "#1A1A1A",
              border: "none",
              cursor: status === "loading" ? "wait" : "pointer",
              fontWeight: 600,
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "#CC2424",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Something went wrong - please try again.
        </p>
      )}
    </section>
  );
}
