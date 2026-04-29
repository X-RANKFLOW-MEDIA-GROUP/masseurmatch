import Link from "next/link";
import type { CSSProperties } from "react";

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "2rem",
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "36rem",
  borderRadius: "1.5rem",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "#ffffff",
  padding: "2rem",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
};

const linkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9999px",
  background: "#0f172a",
  color: "#ffffff",
  padding: "0.875rem 1.25rem",
  fontWeight: 600,
  textDecoration: "none",
};

export default function Custom500Page() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
          MasseurMatch
        </p>
        <h1 style={{ margin: "1rem 0 0", fontSize: "2.5rem", lineHeight: 1.05 }}>
          Something went wrong on our side.
        </h1>
        <p style={{ margin: "1rem 0 0", fontSize: "1rem", lineHeight: 1.7, color: "#475569" }}>
          We could not load this page right now. Please try again in a moment, or return to the homepage while we get things back on track.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/" style={linkStyle}>
            Back to Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
