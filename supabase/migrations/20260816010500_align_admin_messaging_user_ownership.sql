-- Align legacy messaging tables with the canonical admin messaging model.
--
-- Contacts in this subsystem are external outreach records keyed by phone,
-- not authenticated MasseurMatch users. Older table shapes left user_id as
-- NOT NULL. The canonical messaging migration and schema lock do not require
-- that ownership, so relax only the legacy constraint without dropping the
-- compatibility column or its foreign key.

do $$
declare
  v_table_name text;
begin
  foreach v_table_name in array array[
    'messaging_contacts',
    'messaging_conversations',
    'messaging_messages',
    'messaging_queue'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = v_table_name
        and c.column_name = 'user_id'
        and c.is_nullable = 'NO'
    ) then
      execute format(
        'alter table public.%I alter column user_id drop not null',
        v_table_name
      );
    end if;
  end loop;
end
$$;

notify pgrst, 'reload schema';
