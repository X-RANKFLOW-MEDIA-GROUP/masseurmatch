import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SEO_BLOG_POSTS } from "../src/lib/seo/contentTemplates";
import { getProgrammaticPublicPaths } from "../src/lib/seo/routes";
import { hasCompetitorBrandInTitle, hasUnsafeWording, BOOKING_PROMISE_PATTERNS, FAKE_VERIFICATION_PATTERNS } from "../src/lib/seo/qualityRules";
import { PRIVATE_ROUTE_PATTERNS } from "../src/lib/seo/site";

const errors: string[] = [];

function ensure(condition: boolean, message: string) {
  if (!condition) errors.push(message);
}

const publicPaths = getProgrammaticPublicPaths();
const uniquePaths = new Set(publicPaths);
ensure(uniquePaths.size === publicPaths.length, "Duplicate slug: duplicate public path detected");

for (const path of publicPaths) {
  ensure(!PRIVATE_ROUTE_PATTERNS.some((privateRoute) => path.startsWith(privateRoute)), `Private route indexable: ${path}`);
}

for (const post of SEO_BLOG_POSTS) {
  ensure(Boolean(post.metaTitle.trim()), `Missing title: ${post.slug}`);
  ensure(Boolean(post.metaDescription.trim()), `Missing meta description: ${post.slug}`);
  ensure(!hasCompetitorBrandInTitle(post.metaTitle), `Competitor brand keyword used in public title: ${post.slug}`);
  ensure(!hasUnsafeWording(`${post.title} ${post.metaDescription} ${post.body.join(" ")}`), `Unsafe adult wording: ${post.slug}`);
  ensure(post.body.join(" ").split(/\s+/).length >= 120, `Thin blog article: ${post.slug}`);
  ensure(post.faq.length > 0, `FAQ schema without visible FAQ: ${post.slug}`);
  ensure(!BOOKING_PROMISE_PATTERNS.some((pattern) => pattern.test(post.body.join(" "))), `Booking language that implies in platform booking: ${post.slug}`);
  ensure(!FAKE_VERIFICATION_PATTERNS.some((pattern) => pattern.test(post.body.join(" "))), `Fake verification claim: ${post.slug}`);
}

const sitemapSource = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
ensure(sitemapSource.includes("/massage"), "Missing canonical sitemap coverage for massage routes");
ensure(!/\/admin|\/dashboard|\/api\//.test(sitemapSource), "Blocked route inside sitemap");

const robotsSource = readFileSync(join(process.cwd(), "src/app/robots.ts"), "utf8");
ensure(robotsSource.includes("sitemap"), "Missing canonical sitemap in robots");

if (errors.length) {
  console.error("SEO audit failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`SEO audit passed. Checked ${publicPaths.length} public routes and ${SEO_BLOG_POSTS.length} blog posts.`);
