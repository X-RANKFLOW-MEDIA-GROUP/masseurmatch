import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

try {
  run("pnpm seo:audit:competitors");
  run("pnpm validate:sitemap");
  console.log("[seo:audit] OK");
} catch (error) {
  console.error("[seo:audit] FAILED");
  process.exit(1);
}
