import { after } from "next/server";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { processPendingMigrations } from "@/app/api/migrate/_lib/processor";
import { sendEmail } from "@/app/api/_lib/email";
import React from "react";

interface ProfileUrl {
  platform: string;
  url: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileUrls, email } = body;

    if (!Array.isArray(profileUrls) || profileUrls.length === 0) {
      throw new RouteError(400, "At least one profile URL is required.");
    }

    if (!email || typeof email !== "string") {
      throw new RouteError(400, "Email is required.");
    }

    const adminClient = createSupabaseAdminClient();

    // Store migration requests in database
    const migrationData = profileUrls.map((pu: ProfileUrl) => ({
      email,
      platform: pu.platform,
      source_url: pu.url,
      status: "pending" as const,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await ((adminClient as any)
      .from("profile_migrations")
      .insert(migrationData));

    if (insertError) {
      console.error("[api/migrate/initiate] Insert error:", insertError.message);
      throw new RouteError(500, "Could not save migration request.");
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: "We're Importing Your Profile — Sit Back & Relax",
        react: React.createElement("div", {
          dangerouslySetInnerHTML: {
            __html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { border-bottom: 3px solid #8B1E2D; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #111111; font-size: 24px; font-weight: bold; }
                    .content { margin-bottom: 30px; }
                    .content p { margin: 15px 0; }
                    .step { background: #FAFAFA; border-left: 4px solid #8B1E2D; padding: 15px; margin: 15px 0; }
                    .step h3 { margin-top: 0; color: #8B1E2D; }
                    .cta-button { display: inline-block; background-color: #8B1E2D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .footer { border-top: 1px solid #E8E8E8; padding-top: 20px; font-size: 12px; color: #8E8E8E; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Welcome to MasseurMatch</h1>
                    </div>

                    <div class="content">
                      <p>Hi there,</p>
                      <p>Great news! We've received your profile URLs and we're already working on importing your reviews, ratings, and service history to MasseurMatch.</p>

                      <div class="step">
                        <h3>📋 What's Happening</h3>
                        <p>We're extracting your profiles from the directories you provided and consolidating everything into your new MasseurMatch listing. This includes:</p>
                        <ul>
                          <li>All client reviews and ratings</li>
                          <li>Your service history</li>
                          <li>Verified status and trust signals</li>
                        </ul>
                      </div>

                      <div class="step">
                        <h3>⏱️ Timeline</h3>
                        <p>Migration typically takes 24–48 hours. We'll send you an email as soon as your profile is live on MasseurMatch, and you can start accepting bookings right away.</p>
                      </div>

                      <div class="step">
                        <h3>🤝 Need Help?</h3>
                        <p>If you have questions about the migration or need to add more profiles, just reply to this email or contact our support team at concierge@masseurmatch.com.</p>
                      </div>

                      <p>We're excited to have you on board!</p>
                      <p><strong>The MasseurMatch Team</strong></p>
                    </div>

                    <div class="footer">
                      <p>© 2025 MasseurMatch. All rights reserved.</p>
                      <p>This is an automated message. Please do not reply directly to this email if you're having issues — contact us at concierge@masseurmatch.com instead.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          },
        }),
      }).catch((err) => {
        console.error("[api/migrate/initiate] Email send failed:", err);
        // Don't throw — email failure shouldn't block the migration request
      });
    } catch (emailErr) {
      console.error("[api/migrate/initiate] Email error:", emailErr);
    }

    // Kick off scraping as soon as the response is sent instead of waiting
    // for the next cron sweep. The cron route remains the retry safety net.
    after(async () => {
      try {
        await processPendingMigrations();
      } catch (err) {
        console.error("[api/migrate/initiate] Background processing failed:", err);
      }
    });

    return json({
      ok: true,
      message: "Migration request received. You'll be notified when your profile is ready.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
