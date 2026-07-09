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
  return (
    <html>
      <head>
        <style>
          {`
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 3px solid #8B1E2D; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #111111; font-size: 24px; font-weight: bold; }
            .content { margin-bottom: 30px; }
            .content p { margin: 15px 0; }
            .stat-box { background: #F8EDEE; border-left: 4px solid #8B1E2D; padding: 20px; margin: 20px 0; text-align: center; }
            .stat-box .number { color: #8B1E2D; font-size: 32px; font-weight: bold; }
            .stat-box .label { color: #6F6F6F; font-size: 14px; margin-top: 5px; }
            .cta-button { display: inline-block; background-color: #8B1E2D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .cta-button:hover { background-color: #6E1521; }
            .next-steps { background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .next-steps h3 { margin-top: 0; color: #8B1E2D; }
            .next-steps ol { padding-left: 20px; }
            .next-steps li { margin: 10px 0; }
            .footer { border-top: 1px solid #E8E8E8; padding-top: 20px; font-size: 12px; color: #8E8E8E; }
            .social-proof { background: #FAFAFA; border: 1px solid #E8E8E8; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .social-proof p { margin: 5px 0; font-size: 14px; }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🎉 Your Profile Is Live!</h1>
          </div>

          <div className="content">
            <p>Hi {therapistName},</p>
            <p>Excellent news! Your profile migration from {platform} is complete, and your profile is now live on MasseurMatch.</p>

            <div className="stat-box">
              <div className="number">{importedReviews}</div>
              <div className="label">Reviews & Ratings Migrated</div>
            </div>

            <p>
              Your reviews, ratings, and service history have been imported, so clients can already see your track record on MasseurMatch.
              Your profile is fully searchable and ready to accept bookings.
            </p>

            <div className="next-steps">
              <h3>What's Next?</h3>
              <ol>
                <li>
                  <strong>Review Your Profile:</strong> Log in to your dashboard to verify everything looks right.
                </li>
                <li>
                  <strong>Add Photos:</strong> Upload professional photos to showcase your space and services.
                </li>
                <li>
                  <strong>Customize Availability:</strong> Set your hours and manage your booking calendar.
                </li>
                <li>
                  <strong>Start Accepting Bookings:</strong> Clients can book you directly from your profile.
                </li>
              </ol>
            </div>

            <p style={{ textAlign: "center" }}>
              <a href={dashboardUrl} className="cta-button">View Your Profile</a>
            </p>

            <div className="social-proof">
              <p>
                <strong>Did you know?</strong> Therapists on MasseurMatch with complete profiles receive 3x more booking requests.
                The more detail you add, the more clients find you.
              </p>
            </div>

            <p>
              If you'd like to add more profiles from other directories or need help with anything, just reply to this email or
              reach out to <strong>concierge@masseurmatch.com</strong>.
            </p>

            <p>Welcome to MasseurMatch!</p>
            <p><strong>The MasseurMatch Team</strong></p>
          </div>

          <div className="footer">
            <p>© 2025 MasseurMatch. All rights reserved.</p>
            <p>
              You're receiving this email because your profile migration from {platform} has been completed.
              Questions? Contact concierge@masseurmatch.com
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
