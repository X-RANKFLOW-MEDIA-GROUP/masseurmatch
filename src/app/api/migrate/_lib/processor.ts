import { createSupabaseWebhookAdminClient } from "@/app/api/_lib/supabase-server";

export interface ScrapedReview {
  reviewer_name: string | null;
  rating: number | null;
  review_text: string | null;
  review_date: string | null; // ISO string
}

interface PendingMigration {
  id: string;
  email: string;
  profile_id: string | null;
  platform: string;
  source_url: string;
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 3_000_000;
const BATCH_LIMIT = 10;

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MasseurMatchImporter/1.0; +https://masseurmatch.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.warn(`[migrate/processor] Fetch ${url} returned ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html") && !contentType.includes("xml")) {
      return null;
    }

    const text = await res.text();
    return text.length > MAX_HTML_BYTES ? text.slice(0, MAX_HTML_BYTES) : text;
  } catch (err) {
    console.warn(`[migrate/processor] Fetch failed for ${url}:`, err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeRating(value: unknown, best: unknown): number | null {
  const rating = typeof value === "string" ? Number.parseFloat(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(rating)) return null;

  const bestRating =
    typeof best === "string" ? Number.parseFloat(best) : typeof best === "number" ? best : 5;
  const scale = Number.isFinite(bestRating) && bestRating > 0 ? bestRating : 5;

  const scaled = (rating / scale) * 5;
  const clamped = Math.min(5, Math.max(1, scaled));
  return Math.round(clamped * 10) / 10;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function asText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

// Walks any JSON-LD value and collects schema.org Review objects, including
// ones nested in @graph containers or a parent entity's `review` property.
function collectJsonLdReviews(node: unknown, out: ScrapedReview[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdReviews(item, out);
    return;
  }

  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;

  const type = obj["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((t) => typeof t === "string" && t.toLowerCase() === "review")) {
    const author = obj.author;
    const authorName =
      asText(author) ??
      (author && typeof author === "object"
        ? asText((author as Record<string, unknown>).name)
        : null);

    const reviewRating = obj.reviewRating;
    const rating =
      reviewRating && typeof reviewRating === "object"
        ? normalizeRating(
            (reviewRating as Record<string, unknown>).ratingValue,
            (reviewRating as Record<string, unknown>).bestRating,
          )
        : null;

    const text = asText(obj.reviewBody) ?? asText(obj.description);
    const date = normalizeDate(obj.datePublished);

    if (text || rating) {
      out.push({
        reviewer_name: authorName,
        rating,
        review_text: text,
        review_date: date,
      });
    }
  }

  for (const key of ["@graph", "review", "reviews", "itemListElement", "mainEntity"]) {
    if (key in obj) collectJsonLdReviews(obj[key], out);
  }
}

// Generic extractor: schema.org JSON-LD blocks are the one review format that
// is machine-readable across arbitrary directory sites without per-site DOM
// selectors, so it is the default for every platform.
function extractJsonLdReviews(html: string): ScrapedReview[] {
  const reviews: ScrapedReview[] = [];
  const scriptPattern =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      collectJsonLdReviews(JSON.parse(match[1]), reviews);
    } catch {
      // Malformed JSON-LD block — skip it, keep scanning.
    }
  }

  return reviews;
}

// Per-platform overrides. Source directories that don't publish JSON-LD need
// site-specific DOM parsing added here; until then they fall through to the
// generic extractor and, when that finds nothing, the migration is routed to
// manual review instead of being silently completed empty.
const PLATFORM_SCRAPERS: Record<string, (html: string) => ScrapedReview[]> = {};

export async function scrapeReviews(url: string, platform: string): Promise<ScrapedReview[]> {
  const html = await fetchHtml(url);
  if (!html) return [];

  const platformScraper = PLATFORM_SCRAPERS[platform];
  if (platformScraper) {
    const platformReviews = platformScraper(html);
    if (platformReviews.length > 0) return platformReviews;
  }

  return extractJsonLdReviews(html);
}

export interface ProcessResult {
  processed: number;
  imported: number;
  manualReview: number;
  failed: number;
}

export async function processPendingMigrations(): Promise<ProcessResult> {
  // Cast: profile_migrations/imported_reviews aren't in the generated
  // Database types yet (same approach as the other migrate routes).
  const db = createSupabaseWebhookAdminClient() as any;
  const result: ProcessResult = { processed: 0, imported: 0, manualReview: 0, failed: 0 };

  const { data: migrations, error: selectError } = await db
    .from("profile_migrations")
    .select("id, email, profile_id, platform, source_url")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (selectError) {
    console.error("[migrate/processor] Select error:", selectError.message);
    throw new Error(selectError.message);
  }

  for (const migration of (migrations ?? []) as PendingMigration[]) {
    try {
      await db
        .from("profile_migrations")
        .update({ status: "in_progress" })
        .eq("id", migration.id);

      const reviews = await scrapeReviews(migration.source_url, migration.platform);

      if (reviews.length === 0) {
        // Nothing machine-readable on the page — flag for the concierge team
        // rather than reporting a completed-but-empty import.
        await db
          .from("profile_migrations")
          .update({
            status: "manual_review",
            migration_notes:
              "Automatic import found no structured reviews at the source URL. Manual import required.",
            imported_review_count: 0,
          })
          .eq("id", migration.id);
        result.manualReview += 1;
        result.processed += 1;
        continue;
      }

      // Clear any rows left behind by a previously interrupted run so a retry
      // never duplicates reviews for the same migration.
      await db.from("imported_reviews").delete().eq("migration_id", migration.id);

      const { error: insertError } = await db.from("imported_reviews").insert(
        reviews.map((review) => ({
          profile_id: migration.profile_id,
          migration_id: migration.id,
          source_platform: migration.platform,
          source_url: migration.source_url,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          review_text: review.review_text,
          review_date: review.review_date,
          is_public: false,
        })),
      );

      if (insertError) {
        throw new Error(`Failed to insert reviews: ${insertError.message}`);
      }

      await db
        .from("profile_migrations")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          imported_review_count: reviews.length,
        })
        .eq("id", migration.id);

      result.imported += reviews.length;
      result.processed += 1;
    } catch (err) {
      console.error(`[migrate/processor] Migration ${migration.id} failed:`, err);
      await db
        .from("profile_migrations")
        .update({
          status: "failed",
          migration_notes: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        })
        .eq("id", migration.id);
      result.failed += 1;
      result.processed += 1;
    }
  }

  return result;
}
