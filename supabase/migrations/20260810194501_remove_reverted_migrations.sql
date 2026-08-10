-- Remove problematic migrations from history
-- The Supabase CLI repair mechanism requires deletion, not status marking
DELETE FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20260810182139',
  '20260810190905',
  '20260810192151',
  '20260810192358',
  '20260810192850',
  '20260810193240'
);
