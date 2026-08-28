-- Align public.profiles.profile_status with the text contract declared by the
-- application, schema lock, generated TypeScript types, and historical migrations.
--
-- Production drifted to public.profile_status enum. That breaks runtime code that
-- intentionally treats profile_status as text. This migration converts the column
-- back to text while preserving the live dependent views, policies, indexes,
-- trigger definitions, owners, grants, and security_invoker view option.

do $migration$
declare
  r record;
  v_attnum smallint;
  v_definition text;
  v_clause text;
begin
  if to_regtype('public.profile_status') is null then
    raise notice 'public.profile_status does not exist; enum conversion is not required';
    return;
  end if;

  select a.attnum
    into v_attnum
    from pg_attribute a
   where a.attrelid = 'public.profiles'::regclass
     and a.attname = 'profile_status'
     and a.atttypid = to_regtype('public.profile_status')
     and not a.attisdropped;

  if v_attnum is null then
    raise notice 'public.profiles.profile_status is already non-enum; conversion is not required';
    return;
  end if;

  create temp table _ps_views on commit drop as
    select c.oid as view_oid,
           c.relname as view_name,
           c.relkind as view_kind,
           pg_get_viewdef(c.oid, true) as definition,
           c.reloptions as options,
           pg_get_userbyid(c.relowner) as owner
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind in ('v', 'm')
       and exists (
             select 1
               from pg_depend d
               join pg_rewrite rw on rw.oid = d.objid
              where rw.ev_class = c.oid
                and d.refclassid = 'pg_class'::regclass
                and d.refobjid = 'public.profiles'::regclass
                and d.refobjsubid = v_attnum
           );

  create temp table _ps_view_grants on commit drop as
    select v.view_name,
           case when acl.grantee = 0 then 'public'
                else pg_get_userbyid(acl.grantee) end as grantee,
           acl.privilege_type
      from _ps_views v
      join pg_class c on c.oid = v.view_oid,
           aclexplode(c.relacl) acl;

  create temp table _ps_policies on commit drop as
    select n.nspname as schema_name,
           c.relname as table_name,
           pol.polname as policy_name,
           pol.polpermissive as is_permissive,
           pol.polcmd as cmd,
           case
             when pol.polroles = '{0}'::oid[] then array['public']
             else (
               select array_agg(quote_ident(rolname) order by rolname)
                 from pg_roles
                where oid = any (pol.polroles)
             )
           end as roles,
           pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
           pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expr
      from pg_policy pol
      join pg_class c on c.oid = pol.polrelid
      join pg_namespace n on n.oid = c.relnamespace
     where coalesce(pg_get_expr(pol.polqual, pol.polrelid), '') like '%profile_status%'
        or coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid), '') like '%profile_status%';

  create temp table _ps_indexes on commit drop as
    select distinct
           i.indexrelid::regclass::text as index_name,
           pg_get_indexdef(i.indexrelid) as definition
      from pg_index i
     where i.indrelid = 'public.profiles'::regclass
       and v_attnum = any (i.indkey::smallint[])
       and i.indexrelid not in (
             select conindid
               from pg_constraint
              where conrelid = 'public.profiles'::regclass
           );

  create temp table _ps_triggers on commit drop as
    select t.tgname as trigger_name,
           pg_get_triggerdef(t.oid) as definition,
           t.tgenabled as enabled
      from pg_trigger t
     where t.tgrelid = 'public.profiles'::regclass
       and not t.tgisinternal
       and v_attnum = any (t.tgattr::smallint[]);

  for r in select trigger_name from _ps_triggers loop
    execute format('drop trigger %I on public.profiles', r.trigger_name);
  end loop;

  for r in select view_name, view_kind from _ps_views order by view_oid desc loop
    execute format(
      'drop %s public.%I',
      case when r.view_kind = 'm' then 'materialized view' else 'view' end,
      r.view_name
    );
  end loop;

  for r in select schema_name, table_name, policy_name from _ps_policies loop
    execute format('drop policy %I on %I.%I', r.policy_name, r.schema_name, r.table_name);
  end loop;

  for r in select index_name from _ps_indexes loop
    execute format('drop index %s', r.index_name);
  end loop;

  -- The live enum drift also recreated this check constraint with enum operands.
  -- It must be removed before ALTER COLUMN TYPE; otherwise PostgreSQL attempts to
  -- compare the new text column against enum constants and raises 42883.
  alter table public.profiles
    drop constraint if exists profiles_profile_status_check;

  alter table public.profiles alter column profile_status drop default;
  alter table public.profiles
    alter column profile_status type text using profile_status::text;
  alter table public.profiles alter column profile_status set default 'draft';
  alter table public.profiles alter column profile_status set not null;

  for r in select index_name, definition from _ps_indexes loop
    execute replace(
      replace(r.definition, '::public.profile_status', '::text'),
      '::profile_status',
      '::text'
    );
  end loop;

  for r in select * from _ps_triggers loop
    execute replace(
      replace(r.definition, '::public.profile_status', '::text'),
      '::profile_status',
      '::text'
    );

    if r.enabled <> 'O' then
      execute format(
        'alter table public.profiles %s trigger %I',
        case r.enabled
          when 'D' then 'disable'
          when 'R' then 'enable replica'
          when 'A' then 'enable always'
        end,
        r.trigger_name
      );
    end if;
  end loop;

  for r in select * from _ps_policies loop
    v_clause := '';

    if r.using_expr is not null then
      v_clause := v_clause || ' using ('
        || replace(
             replace(r.using_expr, '::public.profile_status', '::text'),
             '::profile_status',
             '::text'
           ) || ')';
    end if;

    if r.check_expr is not null then
      v_clause := v_clause || ' with check ('
        || replace(
             replace(r.check_expr, '::public.profile_status', '::text'),
             '::profile_status',
             '::text'
           ) || ')';
    end if;

    execute format(
      'create policy %I on %I.%I as %s for %s to %s%s',
      r.policy_name,
      r.schema_name,
      r.table_name,
      case when r.is_permissive then 'permissive' else 'restrictive' end,
      case r.cmd
        when 'r' then 'select'
        when 'a' then 'insert'
        when 'w' then 'update'
        when 'd' then 'delete'
        else 'all'
      end,
      array_to_string(r.roles, ', '),
      v_clause
    );
  end loop;

  for r in select * from _ps_views order by view_oid loop
    v_definition := replace(
      replace(r.definition, '::public.profile_status', '::text'),
      '::profile_status',
      '::text'
    );

    execute format(
      'create %s public.%I as %s',
      case when r.view_kind = 'm' then 'materialized view' else 'view' end,
      r.view_name,
      v_definition
    );

    execute format(
      'alter %s public.%I owner to %I',
      case when r.view_kind = 'm' then 'materialized view' else 'view' end,
      r.view_name,
      r.owner
    );

    if r.view_kind = 'v'
       and coalesce(r.options, '{}'::text[]) @> array['security_invoker=true'] then
      execute format('alter view public.%I set (security_invoker = true)', r.view_name);
    end if;

    for v_clause in
      select format('grant %s on public.%I to %s', g.privilege_type, g.view_name, g.grantee)
        from _ps_view_grants g
       where g.view_name = r.view_name
    loop
      execute v_clause;
    end loop;
  end loop;

  drop type public.profile_status;
end;
$migration$;

-- Restore the domain guarantee expected by the repository contract.
alter table public.profiles
  drop constraint if exists profiles_profile_status_check;
alter table public.profiles
  add constraint profiles_profile_status_check
  check (profile_status in (
    'draft',
    'pending',
    'pending_approval',
    'under_review',
    'approved',
    'suspended',
    'rejected',
    'changes_requested'
  ));

-- Keep the unconditional runtime synchronization trigger type-safe even if an
-- environment temporarily drifts again before this migration is applied.
create or replace function public.sync_profiles_runtime_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.user_id := coalesce(new.user_id, new.id);
  new.email_address := coalesce(new.email_address, new.email);
  new.subscription_tier := coalesce(new.subscription_tier, 'free');
  new.status := coalesce(new.status, new.profile_status::text, 'pending');
  new.profile_status := coalesce(new.profile_status, 'draft');
  new.visibility_status := coalesce(new.visibility_status, 'hidden');
  new.is_active := coalesce(new.is_active, true);
  new.starting_price := coalesce(new.starting_price, new.incall_price, new.outcall_price);
  return new;
end;
$$;

do $verify$
declare
  v_udt text;
begin
  select c.udt_name
    into v_udt
    from information_schema.columns c
   where c.table_schema = 'public'
     and c.table_name = 'profiles'
     and c.column_name = 'profile_status';

  if v_udt is distinct from 'text' then
    raise exception 'public.profiles.profile_status must be text, found %', v_udt;
  end if;

  if to_regtype('public.profile_status') is not null then
    raise exception 'public.profile_status enum still exists';
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.profiles'::regclass
       and conname = 'profiles_profile_status_check'
  ) then
    raise exception 'profiles_profile_status_check is missing';
  end if;

  for v_udt in
    select unnest(array[
      'public.public_therapists',
      'public.provider_profiles_private',
      'public.ai_profile_coach_source'
    ])
  loop
    if to_regclass(v_udt) is null then
      raise exception 'view % was not rebuilt', v_udt;
    end if;
  end loop;

  if not exists (
    select 1
      from pg_policy
     where polrelid = 'public.profiles'::regclass
       and polname = 'profiles_public_read_active'
  ) then
    raise exception 'profiles_public_read_active policy was not rebuilt';
  end if;

  if not exists (
    select 1
      from pg_policy
     where polrelid = 'public.contact_inquiries'::regclass
       and polname = 'contact_inquiries_insert_public'
  ) then
    raise exception 'contact_inquiries_insert_public policy was not rebuilt';
  end if;

  if not exists (
    select 1
      from pg_trigger
     where tgrelid = 'public.profiles'::regclass
       and tgname = 'trg_normalize_profiles_profile_status'
  ) then
    raise exception 'trg_normalize_profiles_profile_status was not rebuilt';
  end if;

  if not coalesce(
       (
         select c.reloptions
           from pg_class c
           join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public'
            and c.relname = 'provider_profiles_private'
            and c.relkind = 'v'
       ),
       '{}'::text[]
     ) @> array['security_invoker=true'] then
    raise exception 'public.provider_profiles_private lost security_invoker';
  end if;
end;
$verify$;
