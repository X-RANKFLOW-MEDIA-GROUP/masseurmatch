import { NextResponse } from "next/server";
import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { sendEmail } from "@/app/api/_lib/email";
import React from "react";

interface ReviewDecision {
  reviewId: string;
  approved: boolean;
  notes?: string;
}

// Admin listing for /admin/migrations: pending/processed migrations with
// their imported reviews attached.
export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const adminClient = createSupabaseAdminClient();

    // Cast: profile_migrations/imported_reviews aren't in the generated
    // Supabase types yet (see processor.ts).
    const { data: migrations, error } = await (adminClient as any)
      .from("profile_migrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new RouteError(500, error.message);
    }

    const migrationIds = (migrations ?? []).map((m: { id: string }) => m.id);
    let reviews: Array<{ migration_id: string }> = [];
    if (migrationIds.length > 0) {
      const { data: reviewRows, error: reviewsError } = await (adminClient as any)
        .from("imported_reviews")
        .select("*")
        .in("migration_id", migrationIds);
      if (reviewsError) {
        throw new RouteError(500, reviewsError.message);
      }
      reviews = reviewRows ?? [];
    }

    const items = (migrations ?? []).map((migration: { id: string }) => ({
      ...migration,
      reviews: reviews.filter((review) => review.migration_id === migration.id),
    }));

    return json({ ok: true, migrations: items });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession(request);
    const userId = session.userId;

    const body = await request.json();
    const { migrationId, reviews, notes } = body as {
      migrationId: string;
      reviews: ReviewDecision[];
      notes?: string;
    };

    if (!migrationId || !Array.isArray(reviews)) {
      throw new RouteError(400, "Migration ID and reviews array are required.");
    }

    const adminClient = createSupabaseAdminClient();

    // Update each review's approval status
    for (const decision of reviews) {
      const updateData: Record<string, unknown> = {
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      };

      if (decision.approved) {
        updateData.is_public = true;
      }

      if (decision.notes) {
        updateData.review_notes = decision.notes;
      }

      const { error: updateError } = await ((adminClient as any)
        .from("imported_reviews")
        .update(updateData)
        .eq("id", decision.reviewId));

      if (updateError) {
        console.error("[api/migrate/review] Update error:", updateError.message);
        throw new RouteError(500, "Could not update review status.");
      }
    }

    // Mark migration as verified if all reviews approved
    const approvedCount = reviews.filter((r) => r.approved).length;
    const { data: migration, error: selectError } = await ((adminClient as any)
      .from("profile_migrations")
      .select("*")
      .eq("id", migrationId)
      .single());

    if (selectError) {
      console.error("[api/migrate/review] Select error:", selectError.message);
      throw new RouteError(500, "Could not retrieve migration.");
    }

    if (migration && approvedCount > 0) {
      const { error: migrationError } = await ((adminClient as any)
        .from("profile_migrations")
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: userId,
        })
        .eq("id", migrationId));

      if (!migrationError && migration.email) {
        // Send notification to therapist
        try {
          await sendEmail({
            to: migration.email,
            subject: "Your Profile Migration is Complete — Reviews Now Live!",
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
                        .stat-box { background: #F8EDEE; border-left: 4px solid #8B1E2D; padding: 20px; margin: 20px 0; text-align: center; }
                        .stat-box .number { color: #8B1E2D; font-size: 32px; font-weight: bold; }
                        .cta-button { display: inline-block; background-color: #8B1E2D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                        .footer { border-top: 1px solid #E8E8E8; padding-top: 20px; font-size: 12px; color: #8E8E8E; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>🎉 Your Reviews Are Now Live!</h1>
                        </div>
                        <div class="content">
                          <p>Great news! Your profile migration has been approved and your reviews are now appearing on your MasseurMatch profile.</p>
                          <div class="stat-box">
                            <div class="number">${approvedCount}</div>
                            <div style="color: #6F6F6F; font-size: 14px; margin-top: 5px;">Reviews Published</div>
                          </div>
                          <p>Your reviews are now searchable on MasseurMatch and will help new clients find you. Your profile is live and accepting bookings.</p>
                          <p><a href="https://www.masseurmatch.com/dashboard" class="cta-button">View Your Profile</a></p>
                          <p>Questions? Contact concierge@masseurmatch.com</p>
                          <p><strong>The MasseurMatch Team</strong></p>
                        </div>
                        <div class="footer">
                          <p>© 2025 MasseurMatch. All rights reserved.</p>
                        </div>
                      </div>
                    </body>
                  </html>
                `,
              },
            }),
          }).catch((err) => {
            console.error("[api/migrate/review] Email send failed:", err);
          });
        } catch (emailErr) {
          console.error("[api/migrate/review] Email error:", emailErr);
        }
      }
    }

    return json({
      ok: true,
      message: `${approvedCount} reviews approved and published.`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
