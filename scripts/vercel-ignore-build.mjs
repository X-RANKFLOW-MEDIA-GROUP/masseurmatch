/**
 * Vercel "Ignored Build Step" — decides whether a commit deserves a deployment.
 *
 * Wired up through `ignoreCommand` in vercel.json. Vercel inverts the exit code:
 *   exit 1 → continue building
 *   exit 0 → skip the build (shows as "Skipped", never as "Error")
 *
 * Why this exists: every push to a feature branch used to trigger its own
 * preview build, so a broken work-in-progress commit stayed red in the
 * Deployments list forever — even after the very next commit fixed it. Those
 * records are immutable, so the only cure is to not build throwaway commits.
 *
 * What still builds:
 *   - production (the `main` branch), always;
 *   - preview commits that belong to an open pull request, because CI resolves
 *     that preview URL and runs the Playwright E2E and accessibility suites
 *     against it (see the `preview-url` job in .github/workflows/ci.yml).
 *
 * What gets skipped: pushes to a branch with no pull request open yet. Nothing
 * is lost by skipping those — .github/workflows/ci.yml is also scoped to pull
 * requests and main, so a branch without a pull request is private scratch
 * space. Opening the pull request (a draft counts) turns both on: CI runs
 * typecheck, lint, unit tests, the DB contract and a production build, and
 * Vercel publishes the preview those Playwright suites target.
 */

const PRODUCTION_BRANCH = "main";

const environment = process.env.VERCEL_ENV?.trim() ?? "";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
const pullRequestId = process.env.VERCEL_GIT_PULL_REQUEST_ID?.trim() ?? "";

function build(reason) {
  console.log(`Building: ${reason}.`);
  process.exit(1);
}

function skip(reason) {
  console.log(`Skipping build: ${reason}.`);
  process.exit(0);
}

if (environment === "production" || branch === PRODUCTION_BRANCH) {
  build(`production deployment from ${branch || PRODUCTION_BRANCH}`);
}

if (pullRequestId) {
  build(`preview for pull request #${pullRequestId} on ${branch || "unknown branch"}`);
}

skip(`${branch || "this branch"} has no open pull request, so no preview is needed yet`);
