# Supabase Postgres Best Practices

## Structure

```
supabase-postgres-best-practices/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Mirrors AGENTS.md (must stay in sync)
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

## MasseurMatch Required Database Contract Rule

Before editing Supabase migrations or app code, agents MUST:

1. Scan all references to database tables and columns across:
   - `src/**`
   - `scripts/**`
   - `supabase/**`
2. Compare against the production schema
3. If any mismatch is found:
   - DO NOT patch individual columns
   - Update the full schema contract instead

All database changes must go through a single source of truth:
`supabase/PRODUCTION_SCHEMA_LOCK.sql`

Never deploy partial schema fixes.

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
