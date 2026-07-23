import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CANONICAL_SITEMAP_URL = "https://www.masseurmatch.com/sitemap.xml";

/**
 * Legacy Supabase sitemap endpoint.
 *
 * Canonical sitemap generation now lives in Next.js (src/app/sitemap.ts)
 * so route inventory, canonical URLs, and metadata all share the same source.
 *
 * Keep this endpoint as a permanent one-hop redirect to avoid stale XML output
 * that previously emitted deprecated /massage-therapists and ?lang variants.
 */
serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  return Response.redirect(CANONICAL_SITEMAP_URL, 308);
});
