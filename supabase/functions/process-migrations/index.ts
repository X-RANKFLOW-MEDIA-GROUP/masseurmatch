import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface MigrationData {
  id: string;
  email: string;
  profile_id: string;
  platform: string;
  source_url: string;
}

interface ScrapedReview {
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: Date;
}

// Mock scraper - replace with actual scraping logic per platform
async function scrapeReviews(url: string, platform: string): Promise<ScrapedReview[]> {
  console.log(`[process-migrations] Scraping ${platform}: ${url}`);

  // This is a placeholder. In production, implement:
  // - RubMaps: Parse HTML or use API
  // - 4Corners: Parse HTML or use API
  // - NuruMap: Parse HTML or use API
  // - Custom: Generic HTML parsing with fallback

  // For now, return empty array to avoid errors
  return [];
}

async function processMigrations() {
  try {
    console.log("[process-migrations] Starting migration processing...");

    // Get pending migrations
    const { data: migrations, error: selectError } = await supabase
      .from("profile_migrations")
      .select("*")
      .eq("status", "pending")
      .limit(10);

    if (selectError) {
      console.error("[process-migrations] Select error:", selectError.message);
      throw selectError;
    }

    if (!migrations || migrations.length === 0) {
      console.log("[process-migrations] No pending migrations found.");
      return { processed: 0 };
    }

    console.log(`[process-migrations] Found ${migrations.length} pending migrations`);
    let processedCount = 0;

    for (const migration of migrations as MigrationData[]) {
      try {
        // Mark as in_progress
        await supabase
          .from("profile_migrations")
          .update({ status: "in_progress" })
          .eq("id", migration.id);

        console.log(`[process-migrations] Processing migration ${migration.id} (${migration.platform})`);

        // Scrape reviews from source platform
        const reviews = await scrapeReviews(migration.source_url, migration.platform);

        if (reviews.length === 0) {
          console.log(`[process-migrations] No reviews found for ${migration.id}`);
          // Mark as completed but with 0 reviews
          await supabase
            .from("profile_migrations")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              imported_review_count: 0,
            })
            .eq("id", migration.id);
          processedCount++;
          continue;
        }

        // Insert scraped reviews as "pending admin review" (is_public = false)
        const reviewsToInsert = reviews.map((review) => ({
          profile_id: migration.profile_id,
          migration_id: migration.id,
          source_platform: migration.platform,
          source_url: migration.source_url,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          review_text: review.review_text,
          review_date: review.review_date.toISOString(),
          is_public: false, // Hidden until admin reviews
          reviewed_by: null,
          reviewed_at: null,
        }));

        const { error: insertError } = await supabase
          .from("imported_reviews")
          .insert(reviewsToInsert);

        if (insertError) {
          console.error("[process-migrations] Insert error:", insertError.message);
          await supabase
            .from("profile_migrations")
            .update({
              status: "failed",
              migration_notes: `Failed to insert reviews: ${insertError.message}`,
            })
            .eq("id", migration.id);
          continue;
        }

        // Mark migration as completed
        const { error: updateError } = await supabase
          .from("profile_migrations")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            imported_review_count: reviews.length,
          })
          .eq("id", migration.id);

        if (updateError) {
          console.error("[process-migrations] Update error:", updateError.message);
          continue;
        }

        console.log(`[process-migrations] Completed migration ${migration.id}: ${reviews.length} reviews imported`);
        processedCount++;
      } catch (migrationError) {
        console.error(`[process-migrations] Error processing migration ${migration.id}:`, migrationError);
        await supabase
          .from("profile_migrations")
          .update({
            status: "failed",
            migration_notes: `Error: ${migrationError instanceof Error ? migrationError.message : "Unknown error"}`,
          })
          .eq("id", migration.id);
      }
    }

    console.log(`[process-migrations] Processing complete. Processed: ${processedCount}`);
    return { processed: processedCount };
  } catch (error) {
    console.error("[process-migrations] Fatal error:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await processMigrations();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[process-migrations] Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
