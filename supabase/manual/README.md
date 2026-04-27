# Manual Supabase Migration Execution

This directory contains utilities for running migrations manually via the **Supabase Dashboard → SQL Editor** when the CLI is unavailable.

## Files

- `apply_all_migrations.sql`: single bundle with all migrations from `supabase/migrations`, sorted in lexicographic (timestamp) order.

## Regenerating the bundle

```bash
node scripts/build-manual-migration-bundle.mjs
```

Or specify a custom output path:

```bash
node scripts/build-manual-migration-bundle.mjs --output=tmp/supabase-migrations.sql
```

## Running in the Dashboard

1. Go to **Supabase Dashboard → SQL Editor**.
2. Open the generated SQL file (default: `supabase/manual/apply_all_migrations.sql`).
3. Copy the entire contents and execute.
4. Run the verification queries below (separately):

```sql
SELECT COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT *
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 20;
```

## Notes

- The bundle is generated with `BEGIN; ... COMMIT;` for transactional execution.
- Always validate on staging before running in production.
