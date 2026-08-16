-- Align legacy messaging tables with the canonical admin messaging model.
--
-- Contacts in this subsystem are external outreach records keyed by phone,
-- not authenticated MasseurMatch users. Older table shapes left user_id as
-- NOT NULL. The canonical messaging migration and schema lock do not require
-- that ownership, so relax only the legacy constraint without dropping the
-- compatibility column or its foreign key.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'messaging_contacts',
    'messaging_conversations',
    'messaging_messages',
    'messaging_queue'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and information_schema.columns.table_name = table_name
        and column_name = 'user_id'
        and is_nullable = 'NO'
    ) then
      execute format(
        'alter table public.%I alter column user_id drop not null',
        table_name
      );
    end if;
  end loop;
end
$$;

notify pgrst, 'reload schema';
