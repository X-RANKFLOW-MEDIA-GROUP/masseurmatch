do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'role'
  ) then
    alter table public.users alter column role set default 'provider';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
  ) then
    alter table public.profiles alter column role set default 'provider';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_roles'
      and column_name = 'role'
  ) then
    alter table public.user_roles alter column role set default 'provider';
  end if;
end $$;

update public.users
set role = 'provider', updated_at = timezone('utc', now())
where role = 'therapist';

update public.profiles
set role = 'provider', updated_at = timezone('utc', now())
where role = 'therapist';

alter table public.user_roles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.user_roles
set role = 'provider', updated_at = now()
where role = 'therapist';

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class cls on cls.oid = con.conrelid
    join pg_namespace ns on ns.oid = cls.relnamespace
    where ns.nspname = 'public'
      and cls.relname = 'users'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.users drop constraint if exists %I', constraint_record.conname);
  end loop;

  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class cls on cls.oid = con.conrelid
    join pg_namespace ns on ns.oid = cls.relnamespace
    where ns.nspname = 'public'
      and cls.relname = 'profiles'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint if exists %I', constraint_record.conname);
  end loop;

  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class cls on cls.oid = con.conrelid
    join pg_namespace ns on ns.oid = cls.relnamespace
    where ns.nspname = 'public'
      and cls.relname = 'user_roles'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.user_roles drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.users
  add constraint users_role_check
  check (role in ('admin', 'provider', 'client'));

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'provider', 'client'));

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('admin', 'provider', 'client'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  app_role text;
  display_name text;
begin
  app_role := coalesce(new.raw_user_meta_data ->> 'role', 'provider');

  if app_role = 'therapist' then
    app_role := 'provider';
  end if;

  if app_role not in ('admin', 'provider', 'client') then
    app_role := 'provider';
  end if;

  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'User'
  );

  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, display_name, app_role)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = timezone('utc', now());

  insert into public.profiles (
    id,
    user_id,
    email,
    email_address,
    full_name,
    display_name,
    role,
    status,
    profile_status,
    visibility_status,
    subscription_tier,
    _tier,
    tier
  )
  values (
    new.id,
    new.id,
    new.email,
    new.email,
    display_name,
    display_name,
    app_role,
    'pending',
    'draft',
    'hidden',
    'free',
    'free',
    'free'
  )
  on conflict (id) do update set
    user_id = excluded.user_id,
    email = coalesce(public.profiles.email, excluded.email),
    email_address = coalesce(public.profiles.email_address, excluded.email_address),
    role = excluded.role,
    updated_at = timezone('utc', now());

  insert into public.user_roles (user_id, role)
  values (new.id, app_role)
  on conflict do nothing;

  return new;
end;
$function$;
