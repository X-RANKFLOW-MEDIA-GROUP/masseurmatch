import { execSync } from "child_process";

try {
  // Configure git (if needed)
  console.log("[v0] Checking git status...");
  const status = execSync("git status --porcelain", { cwd: "/vercel/share/v0-project", encoding: "utf-8" });
  console.log("[v0] Git status:\n", status);

  // Stage all changes
  console.log("[v0] Staging all changes...");
  execSync("git add -A", { cwd: "/vercel/share/v0-project" });

  // Create commit
  console.log("[v0] Creating commit...");
  const commitMessage = `fix(auth): correct authentication flow and redirects

- Fixed login redirect from /pro/profile to /pro/dashboard
- Fixed signup flow: /signup/account now redirects to /signup/plan
- Updated /register page with proper auth state handling
- Created RegisterPageClient with session checks
- Fixed AuthForms to redirect new users to /signup/plan (not /pro/onboard)
- Enhanced logout with window.location redirect for full session clearance
- Ensured protected routes properly check authentication via middleware
- All auth flows now maintain consistent redirect patterns`;

  execSync(`git commit -m "${commitMessage}"`, { 
    cwd: "/vercel/share/v0-project",
    stdio: "inherit"
  });

  console.log("[v0] ✅ Commit successful!");
  process.exit(0);
} catch (error) {
  console.error("[v0] ❌ Commit failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
