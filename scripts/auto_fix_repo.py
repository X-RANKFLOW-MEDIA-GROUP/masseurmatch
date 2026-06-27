import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path.cwd()
REPORT = ROOT / "repo-audit-report"
REPORT.mkdir(exist_ok=True)
LOG = REPORT / "audit-log.txt"
LOG.write_text("AUTO FIX REPO LOG\n", encoding="utf-8")

def run(name, cmd, timeout=1800):
    print(f"\n===== {name} =====")
    print(" ".join(cmd))
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"\n\n===== {name} =====\n$ {' '.join(cmd)}\n")
    try:
        p = subprocess.run(" ".join(cmd), cwd=ROOT, text=True, capture_output=True, timeout=timeout, shell=True)
        output = (p.stdout or "") + "\n" + (p.stderr or "")
        print(output)
        with LOG.open("a", encoding="utf-8") as f:
            f.write(output)
            f.write(f"\nEXIT_CODE={p.returncode}\n")
        return p.returncode == 0
    except Exception as e:
        print(str(e))
        with LOG.open("a", encoding="utf-8") as f:
            f.write(str(e))
        return False

def package_json():
    p = ROOT / "package.json"
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))

def get_pm():
    if (ROOT / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (ROOT / "yarn.lock").exists():
        return "yarn"
    return "npm"

def has_merge_conflicts():
    p = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=U"],
        cwd=ROOT,
        text=True,
        capture_output=True
    )
    files = [x.strip() for x in p.stdout.splitlines() if x.strip()]
    return files

pkg = package_json()
scripts = pkg.get("scripts", {})
pm = get_pm()

conflicts = has_merge_conflicts()

if conflicts:
    print("\nMERGE CONFLICTS FOUND:")
    for file in conflicts:
        print("-", file)

    if shutil.which("claude"):
        prompt = """
You are inside this repo.

First resolve all current Git merge conflicts safely.
Use the current product scope and preserve CI quality.
Do not blindly accept one side.
Inspect conflicted files and produce a clean final version.

Then fix all real errors from:
- pnpm validate:db-contract
- lint
- typecheck
- tests
- build
- Vercel/Next.js production build

Important product scope:
This project is MasseurMatch.
Do not add booking, direct payments, calendar scheduling, reviews, or license verification unless the existing code already depends on it and removing it would break the app.
If code references out-of-scope features and causes DB contract failures, prefer removing or disabling those broken references instead of expanding the schema blindly.

Specific current known errors:
- .github/workflows/ci.yml has a merge conflict.
- validate:db-contract is failing because code references columns/tables missing from schema lock:
  moderation_queue.content_type
  payment_transactions.provider_transaction_id
  payment_transactions.provider
  appointments.user_id
  appointments.starts_at
  appointments.ends_at
  text_verifications.reviewed_at
  text_verifications.submitted_text
  text_verifications.code
  profile_reviews.admin_notes
  therapist_photos.therapist_profile_id
  therapist_photos.approval_status
  demand_scores
  admin_actions.action
  admin_actions.target_table

Your job:
1. Resolve merge conflicts.
2. Decide whether each failing DB reference should be removed from code, renamed to an existing schema column, or added to schema lock/migration.
3. Prefer the smallest safe fix.
4. Run pnpm validate:db-contract.
5. Run pnpm lint.
6. Run pnpm typecheck if available.
7. Run pnpm test if available.
8. Run pnpm build.
9. Repeat fixes until checks pass or only missing env vars/secrets remain.
10. Do not commit until the repo is clean and checks pass.
"""
        run("claude resolve conflicts and repair repo", ["claude", prompt], timeout=7200)
    else:
        print("\nClaude CLI not found. Install Claude CLI or resolve conflicts manually first.")
        print("Conflicted files:", conflicts)
        raise SystemExit(1)

pkg = package_json()
scripts = pkg.get("scripts", {})
pm = get_pm()

if pm == "pnpm":
    install = ["pnpm", "install"]
    base = ["pnpm", "run"]
    test_cmd = ["pnpm", "test"]
elif pm == "yarn":
    install = ["yarn", "install"]
    base = ["yarn"]
    test_cmd = ["yarn", "test"]
else:
    install = ["npm", "ci"] if (ROOT / "package-lock.json").exists() else ["npm", "install"]
    base = ["npm", "run"]
    test_cmd = ["npm", "test"]

run("install dependencies", install)

if "lint" in scripts:
    run("lint autofix", base + ["lint", "--", "--fix"])

if "format" in scripts:
    run("format", base + ["format"])

checks = {}

priority_scripts = [
    "validate:db-contract",
    "lint",
    "typecheck",
    "test",
    "build",
]

for script in priority_scripts:
    if script in scripts:
        if script == "test":
            checks[script] = run(script, test_cmd)
        else:
            checks[script] = run(script, base + [script])
    else:
        checks[script] = "missing script"

failed = [k for k, v in checks.items() if v is False]

summary = {
    "package_manager": pm,
    "checks": checks,
    "failed": failed,
    "log_file": str(LOG),
}

(REPORT / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

print("\n===== SUMMARY =====")
print(json.dumps(summary, indent=2))

if failed and shutil.which("claude"):
    prompt = """
You are inside this repo.

Read:
- repo-audit-report/audit-log.txt
- repo-audit-report/summary.json

Fix all real failures from the latest run.
Do not add new product features.
Do not rewrite the app.
Preserve current design and scope.
Fix the smallest safe issue that makes CI and build pass.

After fixing, rerun:
python scripts/auto_fix_repo.py

Repeat until these pass:
- validate:db-contract
- lint
- typecheck, if available
- test, if available
- build

If only missing env vars or secrets remain, stop and list the exact names needed.
"""
    run("claude auto repair from audit report", ["claude", prompt], timeout=7200)
elif failed:
    print("\nSome checks failed, but Claude CLI was not found.")
    print("Open repo-audit-report/audit-log.txt and fix the listed errors manually.")
else:
    print("\nAll available checks passed.")

