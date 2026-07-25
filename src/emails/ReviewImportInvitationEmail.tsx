import * as React from "react";

interface ReviewImportInvitationEmailProps {
  firstName?: string;
  importUrl?: string;
}

export default function ReviewImportInvitationEmail({
  firstName = "there",
  importUrl = "https://www.masseurmatch.com/pro/import-reviews?utm_source=email&utm_medium=email&utm_campaign=review_import",
}: ReviewImportInvitationEmailProps) {
  const containerStyle: React.CSSProperties = {
    maxWidth: 600,
    margin: "0 auto",
    padding: 24,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.6,
    color: "#25211E",
    backgroundColor: "#FFFFFF",
  };
  const headerStyle: React.CSSProperties = {
    borderBottom: "3px solid #8B1E2D",
    paddingBottom: 20,
    marginBottom: 28,
  };
  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: "#8B1E2D",
    color: "#FFFFFF",
    padding: "13px 24px",
    textDecoration: "none",
    borderRadius: 8,
    fontWeight: 700,
  };
  const infoStyle: React.CSSProperties = {
    backgroundColor: "#FCF7F5",
    border: "1px solid #EAD8D9",
    borderRadius: 10,
    padding: 18,
    margin: "22px 0",
  };
  const footerStyle: React.CSSProperties = {
    borderTop: "1px solid #E8E8E8",
    marginTop: 30,
    paddingTop: 18,
    color: "#756D67",
    fontSize: 12,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={{ margin: 0, color: "#8B1E2D", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          MasseurMatch Provider Tool
        </p>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, lineHeight: 1.25, color: "#111111" }}>
          Bring your existing reviews to MasseurMatch
        </h1>
      </div>

      <p>Hi {firstName},</p>
      <p>
        Already listed on another massage directory? You can now submit your existing profile link through your MasseurMatch dashboard.
      </p>
      <p>
        Our team will check the source and review eligible ratings and reviews before anything is published. This helps you strengthen your MasseurMatch profile without starting your reputation from zero.
      </p>

      <div style={infoStyle}>
        <p style={{ margin: "0 0 10px", fontWeight: 700 }}>What you need to do</p>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Open the Review Import tool.</li>
          <li>Select the directory where you are listed.</li>
          <li>Paste your public profile link.</li>
          <li>Submit it for review.</li>
        </ol>
      </div>

      <p style={{ textAlign: "center", margin: "26px 0" }}>
        <a href={importUrl} style={buttonStyle}>
          Import My Reviews
        </a>
      </p>

      <p style={{ fontSize: 13, color: "#655E59" }}>
        There is no charge to submit an import request. Submitting a link does not guarantee that every review will be transferred. Only submit profiles and content that belong to you or that you are authorized to use.
      </p>

      <p>
        The MasseurMatch Team
        <br />
        support@masseurmatch.com
      </p>

      <div style={footerStyle}>
        <p style={{ margin: 0 }}>© 2026 MasseurMatch. All rights reserved.</p>
      </div>
    </div>
  );
}
