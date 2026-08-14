#!/bin/bash
# Regenerates Supabase TypeScript types from the live production database.
#
# This script must be run locally on a machine where you can authenticate with Supabase.
# It requires the SUPABASE_ACCESS_TOKEN environment variable to be set.
#
# Usage:
#   export SUPABASE_ACCESS_TOKEN="your-token-here"
#   bash scripts/regenerate-supabase-types.sh

set -e

PROJECT_ID="ijsdpozjfjjufjsoexod"
OUTPUT_FILE="src/integrations/supabase/types.ts"

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN environment variable is not set."
  echo ""
  echo "To set it:"
  echo "  1. Run: pnpm exec supabase login"
  echo "  2. Export the token: export SUPABASE_ACCESS_TOKEN=\"your-token-here\""
  echo "  3. Re-run this script"
  echo ""
  echo "If you don't have a token, you can get one from:"
  echo "  https://supabase.com/dashboard/account/tokens"
  exit 1
fi

echo "Regenerating Supabase types from production database..."
echo "Project ID: $PROJECT_ID"
echo "Output: $OUTPUT_FILE"
echo ""

pnpm exec supabase gen types typescript \
  --project-id "$PROJECT_ID" \
  --schema public \
  > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo "✓ Types regenerated successfully"
  echo ""
  echo "Next steps:"
  echo "  1. Review the changes: git diff $OUTPUT_FILE"
  echo "  2. Verify types compile: pnpm typecheck"
  echo "  3. Commit and push: git add $OUTPUT_FILE && git commit -m 'chore: regenerate Supabase types'"
else
  echo "✗ Failed to regenerate types"
  exit 1
fi
