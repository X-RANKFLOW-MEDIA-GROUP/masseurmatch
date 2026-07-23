#!/usr/bin/env bash
#
# Migrate Vercel project environment variables -> GitHub Actions secrets.
#
# This reads the decrypted env values from the MasseurMatch Vercel project and
# writes them as GitHub Actions repository secrets. Values never leave your
# machine and are never printed.
#
# Requirements (run locally, NOT in the Claude sandbox which blocks the GitHub
# secrets API):
#   - gh CLI, authenticated:  gh auth login
#   - curl, jq, base64
#   - A Vercel token exported as VERCEL_TOKEN
#
# Usage:
#   export VERCEL_TOKEN=vcp_xxx
#   ./scripts/migrate-vercel-secrets-to-github.sh            # DRY RUN (prints plan)
#   APPLY=1 ./scripts/migrate-vercel-secrets-to-github.sh    # actually write secrets
#   APPLY=1 FORCE=1 ...                                      # also overwrite existing ones
#
# Knobs (env vars):
#   TARGET   production | preview | development   (which Vercel env to read; default production)
#   APPLY    0|1  actually write to GitHub (default 0 = dry run)
#   FORCE    0|1  overwrite secrets that already exist in GitHub (default 0 = skip existing)
#
set -euo pipefail

VERCEL_TEAM_ID="${VERCEL_TEAM_ID:-team_srSjjkFDYeFA6HpxgpvxPgox}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-prj_ou8HAE72SwYWaB8EQ5rfPpzXvKlu}"
GH_REPO="${GH_REPO:-X-RANKFLOW-MEDIA-GROUP/masseurmatch}"
TARGET="${TARGET:-production}"
APPLY="${APPLY:-0}"
FORCE="${FORCE:-0}"

# Vercel-managed / auto-injected vars. These are generated and rotated by Vercel
# (Storage & Marketplace integrations, system vars) — copying them into GitHub
# just creates duplicates that silently go stale. Skipped by default.
SKIP_REGEX='^(VERCEL_OIDC_TOKEN|VERCEL_AUTOMATION_BYPASS_SECRET|PORT|KV_.*|POSTGRES_.*|REDIS_URL)$'

: "${VERCEL_TOKEN:?export VERCEL_TOKEN first}"
command -v gh   >/dev/null || { echo "gh CLI not found"; exit 1; }
command -v jq   >/dev/null || { echo "jq not found"; exit 1; }
gh auth status  >/dev/null 2>&1 || { echo "gh not authenticated — run: gh auth login"; exit 1; }

echo "Vercel project : $VERCEL_PROJECT_ID"
echo "GitHub repo    : $GH_REPO"
echo "Vercel env     : $TARGET"
echo "Mode           : $([ "$APPLY" = 1 ] && echo APPLY || echo 'DRY RUN') $([ "$FORCE" = 1 ] && echo '(force overwrite)')"
echo

# Secrets that already exist in GitHub (so we don't clobber them unless FORCE=1).
existing="$(gh secret list --repo "$GH_REPO" --json name -q '.[].name' 2>/dev/null || true)"

# Pull decrypted env from Vercel, one row per key: "KEY\tBASE64(value)"
rows="$(curl -sf -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env?decrypt=true&teamId=${VERCEL_TEAM_ID}" \
  | jq -r --arg t "$TARGET" '
      .envs[]
      | select(.target | index($t))
      | select(.value != null and .value != "")
      | .key + "\t" + (.value | @base64)')"

set_n=0; skip_managed=0; skip_exist=0
while IFS=$'\t' read -r key b64; do
  [ -z "$key" ] && continue
  if [[ "$key" =~ $SKIP_REGEX ]]; then
    printf '  SKIP (vercel-managed)  %s\n' "$key"; skip_managed=$((skip_managed+1)); continue
  fi
  if [ "$FORCE" != 1 ] && grep -qxF "$key" <<<"$existing"; then
    printf '  SKIP (already in gh)   %s\n' "$key"; skip_exist=$((skip_exist+1)); continue
  fi
  if [ "$APPLY" = 1 ]; then
    printf '%s' "$b64" | base64 -d | gh secret set "$key" --repo "$GH_REPO" --body -
    printf '  SET                    %s\n' "$key"
  else
    printf '  WOULD SET              %s\n' "$key"
  fi
  set_n=$((set_n+1))
done <<<"$rows"

echo
echo "Summary: $([ "$APPLY" = 1 ] && echo set || echo 'would set')=$set_n  skipped-managed=$skip_managed  skipped-existing=$skip_exist"
[ "$APPLY" != 1 ] && echo "Dry run only. Re-run with APPLY=1 to write."
