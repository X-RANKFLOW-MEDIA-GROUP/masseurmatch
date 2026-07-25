import * as React from "react";

interface ProfileMigrationCompletedEmailProps {
  therapistName?: string;
  platform: string;
  importedReviews: number;
  profileUrl: string;
  dashboardUrl?: string;
}

export default function ProfileMigrationCompletedEmail({
  therapistName = "Therapist",
  platform,
  importedReviews,
  profileUrl,
  dashboardUrl = "https://www.masseurmatch.com/pro/import-reviews?utm_source=email&utm_medium=email&utm_campaign=review_import_complete",
}: ProfileMigrationCompletedEmailProps) {
  const containerStyle: React.CSSProperties = {
    maxWidth: 600,
    margin: "0 auto",
    padding: 20,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.6,
    color: "#333",
  };
  const headerStyle: React.CSSProperties = {
    borderBottom: "3px solid #8B1E2D",
    paddingBottom: 20,
    marginBottom: 30,
  };
  const statBoxStyle: React.CSSProperties = {
    background: "#F8EDEE",
    borderLeft: "4px solid #8B1E2D",
    padding: 20,
    margin: "20px 0",
    textAlign: "center",
  };
  const ctaButtonStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: "#8B1E2D",
    color: "white",
    padding: "12px 24px",
    textDecoration: "none",
    borderRadius: 6,
    fontWeight: "bold",
    margin: "20px 0",
  };
  const nextStepsStyle: React.CSSProperties = {
    background: "#FAFAFA",
    border: "1px solid #E8E8E8",
    borderRadius: 6,
    padding: 20,
    margin: "20px 0",
  };
  const footerStyle: React.CSSProperties = {
    borderTop: "1px solid #E8E8E8",
    paddingTop: 20,
    fontSize: 12,
    color: "#8E8E8E",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, color: "#111111", fontSize: 24, fontWeight: "bold" }}>
          Your review import was approved
        </h1>
      </div>

      <div style={{ marginBottom: 30 }}>
        <p>Hi {therapistName},</p>
        <p>
          Your review import from {platform} has completed its verification step. Approved reviews are now eligible to appear on your MasseurMatch profile.
        </p>

        <div style={statBoxStyle}>
          <div style={{ color: "#8B1E2D", fontSize: 32, fontWeight: "bold" }}>{importedReviews}</div>
          <div style={{ color: "#6F6F6F", fontSize: 14, marginTop: 5 }}>
            Approved Reviews
          </div>
        </div>

        <p>
          Only approved review content is published. Photos, bio, pricing, availability, and other profile details are not changed by this review-import process.
        </p>

        <div style={nextStepsStyle}>
          <h3 style={{ marginTop: 0, color: "#8B1E2D" }}>What to do next</h3>
          <ol style={{ paddingLeft: 20 }}>
            <li style={{ margin: "10px 0" }}>Open your Review Import dashboard to confirm the status.</li>
            <li style={{ margin: "10px 0" }}>View your public profile and check how approved reviews appear.</li>
            <li style={{ margin: "10px 0" }}>Submit another directory profile if you have additional eligible reviews.</li>
          </ol>
        </div>

        <p style={{ textAlign: "center" }}>
          <a href={dashboardUrl} style={ctaButtonStyle}>
            View Review Imports
          </a>
        </p>

        <p style={{ textAlign: "center", fontSize: 13 }}>
          <a href={profileUrl} style={{ color: "#8B1E2D" }}>
            View public profile
          </a>
        </p>

        <p>
          Questions? Contact <strong>support@masseurmatch.com</strong>.
        </p>
        <p><strong>The MasseurMatch Team</strong></p>
      </div>

      <div style={footerStyle}>
        <p>© 2026 MasseurMatch. All rights reserved.</p>
        <p>
          You are receiving this email because a review-import request from {platform} was processed for your account.
        </p>
      </div>
    </div>
  );
}
