-- featured_masters.profile_id was missing a UNIQUE constraint.
-- The table was created manually in production without it, causing the
-- /api/admin/profile/[id]/feature upsert (onConflict: "profile_id") to return 500.
-- Applied to production via MCP 2026-06-26.

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'featured_masters'
      and constraint_name = 'featured_masters_profile_id_key'
  ) then
    alter table public.featured_masters
      add constraint featured_masters_profile_id_key unique (profile_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'featured_masters'
      and constraint_name = 'featured_masters_profile_id_fkey'
  ) then
    alter table public.featured_masters
      add constraint featured_masters_profile_id_fkey
      foreign key (profile_id) references public.profiles(id) on delete cascade;
  end if;
end $$;
