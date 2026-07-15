import * as React from "react";

interface ProfileMigrationCompletedEmailProps {
  therapistName?: string;
  platform: string;
  importedReviews: number;
  profileUrl: string;
  dashboardUrl: string;
}

export default function ProfileMigrationCompletedEmail({
  therapistName = "Therapist",
  platform,
  importedReviews,
  profileUrl,
  dashboardUrl,
}: ProfileMigrationCompletedEmailProps) {
  const containerStyle = { maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.6, color: "#333" };
  const headerStyle = { borderBottom: "3px solid #8B1E2D", paddingBottom: 20, marginBottom: 30 };
  const h1Style = { margin: 0, color: "#111111", fontSize: 24, fontWeight: "bold" };
  const contentStyle = { marginBottom: 30 };
  const pStyle = { margin: "15px 0" };
  const statBoxStyle = { background: "#F8EDEE", borderLeft: "4px solid #8B1E2D", padding: 20, margin: "20px 0", textAlign: "center" as const };
  const numberStyle = { color: "#8B1E2D", fontSize: 32, fontWeight: "bold" };
  const labelStyle = { color: "#6F6F6F", fontSize: 14, marginTop: 5 };
  const ctaButtonStyle = { display: "inline-block", backgroundColor: "#8B1E2D", color: "white", padding: "12px 24px", textDecoration: "none", borderRadius: 6, fontWeight: "bold", margin: "20px 0" };
  const nextStepsStyle = { background: "#FAFAFA", border: "1px solid #E8E8E8", borderRadius: 6, padding: 20, margin: "20px 0" };
  const nextStepsH3Style = { marginTop: 0, color: "#8B1E2D" };
  const nextStepsOlStyle = { paddingLeft: 20 };
  const nextStepsLiStyle = { margin: "10px 0" };
  const footerStyle = { borderTop: "1px solid #E8E8E8", paddingTop: 20, fontSize: 12, color: "#8E8E8E" };
  const socialProofStyle = { background: "#FAFAFA", border: "1px solid #E8E8E8", padding: 15, borderRadius: 6, margin: "15px 0" };
  const socialProofPStyle = { margin: "5px 0", fontSize: 14 };

  return (
    <div style={containerStyle as React.CSSProperties}>
      <div style={headerStyle}>
        <h1 style={h1Style}>🎉 Your Profile Is Live!</h1>
      </div>

      <div style={contentStyle}>
        <p style={pStyle}>Hi {therapistName},</p>
        <p style={pStyle}>Excellent news! Your profile migration from {platform} is complete, and your profile is now live on MasseurMatch.</p>

        <div style={statBoxStyle}>
          <div style={numberStyle}>{importedReviews}</div>
          <div style={labelStyle}>Reviews & Ratings Migrated</div>
        </div>

        <p style={pStyle}>
          Your reviews, ratings, and service history have been imported, so clients can already see your track record on MasseurMatch.
          Your profile is fully searchable and ready to accept bookings.
        </p>

        <div style={nextStepsStyle}>
          <h3 style={nextStepsH3Style}>What's Next?</h3>
          <ol style={nextStepsOlStyle}>
            <li style={nextStepsLiStyle}>
              <strong>Review Your Profile:</strong> Log in to your dashboard to verify everything looks right.
            </li>
            <li style={nextStepsLiStyle}>
              <strong>Add Photos:</strong> Upload professional photos to showcase your space and services.
            </li>
            <li style={nextStepsLiStyle}>
              <strong>Customize Availability:</strong> Set your hours and manage your booking calendar.
            </li>
            <li style={nextStepsLiStyle}>
              <strong>Start Accepting Bookings:</strong> Clients can book you directly from your profile.
            </li>
          </ol>
        </div>

        <p style={{ textAlign: "center" }}>
          <a href={dashboardUrl} style={ctaButtonStyle as React.CSSProperties}>View Your Profile</a>
        </p>

        <div style={socialProofStyle}>
          <p style={socialProofPStyle}>
            <strong>Did you know?</strong> Therapists on MasseurMatch with complete profiles receive 3x more booking requests.
            The more detail you add, the more clients find you.
          </p>
        </div>

        <p style={pStyle}>
          If you'd like to add more profiles from other directories or need help with anything, just reply to this email or
          reach out to <strong>concierge@masseurmatch.com</strong>.
        </p>

        <p style={pStyle}>Welcome to MasseurMatch!</p>
        <p style={pStyle}><strong>The MasseurMatch Team</strong></p>
      </div>

      <div style={footerStyle}>
        <p>© 2025 MasseurMatch. All rights reserved.</p>
        <p>
          You're receiving this email because your profile migration from {platform} has been completed.
          Questions? Contact concierge@masseurmatch.com
        </p>
      </div>
    </div>
  );
}
