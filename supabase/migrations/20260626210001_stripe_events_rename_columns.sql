-- Rename stripe_events columns to match application code.
-- Idempotent: checks for old column names before renaming.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'stripe_events'
      and column_name = 'event_id'
  ) then
    alter table public.stripe_events rename column event_id to stripe_event_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'stripe_events'
      and column_name = 'type'
  ) then
    alter table public.stripe_events rename column type to event_type;
  end if;
end $$;
