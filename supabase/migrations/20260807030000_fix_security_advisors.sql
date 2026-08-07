-- Harden Supabase security advisor findings without changing app behavior.
--
-- 1. admin_email_templates / admin_email_campaigns are server-only tables.
--    service_role is the only role with direct table privileges and bypasses RLS,
--    so permissive USING (true) policies are unnecessary.
-- 2. set_updated_at must pin search_path to prevent caller-controlled object resolution.
--
-- Deliberately not changing public.is_admin() here. Multiple production RLS policies
-- depend on it and a previous EXECUTE revoke broke anonymous public profile reads.

begin;

drop policy if exists admin_email_templates_all on public.admin_email_templates;
drop policy if exists admin_email_campaigns_all on public.admin_email_campaigns;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = pg_catalog.timezone('utc', now());
  return new;
end;
$$;

commit;
