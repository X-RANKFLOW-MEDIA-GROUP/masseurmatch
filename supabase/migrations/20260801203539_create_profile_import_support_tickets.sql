alter table public.support_tickets
  add column if not exists import_migration_id uuid null references public.profile_migrations(id) on delete set null;

create unique index if not exists support_tickets_import_migration_id_uidx
  on public.support_tickets(import_migration_id)
  where import_migration_id is not null;

create or replace function public.create_profile_import_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_ticket_id uuid;
  v_profile_name text;
  v_platform_label text;
begin
  select p.user_id, coalesce(nullif(p.display_name, ''), nullif(p.full_name, ''), 'Provider')
    into v_user_id, v_profile_name
  from public.profiles p
  where p.id = new.profile_id;

  if v_user_id is null then
    return new;
  end if;

  v_platform_label := case
    when new.platform is null or new.platform = '' or new.platform = 'custom' then 'another platform'
    else initcap(replace(new.platform, '_', ' '))
  end;

  insert into public.support_tickets (
    user_id,
    profile_id,
    subject,
    category,
    status,
    priority,
    source,
    import_migration_id
  ) values (
    v_user_id,
    new.profile_id,
    'Profile import request',
    'profile',
    'open',
    'medium',
    'profile_import',
    new.id
  )
  on conflict (import_migration_id) where import_migration_id is not null do nothing
  returning id into v_ticket_id;

  if v_ticket_id is not null then
    insert into public.support_ticket_messages (
      ticket_id,
      sender_id,
      sender_role,
      body,
      external_id
    ) values (
      v_ticket_id,
      v_user_id,
      'provider',
      'Automatic profile import request submitted.' || E'\n\n' ||
      'Provider: ' || v_profile_name || E'\n' ||
      'Source: ' || v_platform_label || E'\n' ||
      'Profile URL: ' || new.source_url || E'\n' ||
      'Import status: ' || new.status || E'\n' ||
      'Migration ID: ' || new.id::text,
      'profile-import:' || new.id::text
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profile_migration_create_ticket on public.profile_migrations;
create trigger profile_migration_create_ticket
after insert on public.profile_migrations
for each row execute function public.create_profile_import_ticket();

with missing as (
  select
    pm.id as migration_id,
    pm.profile_id,
    pm.source_url,
    pm.platform,
    pm.status,
    p.user_id,
    coalesce(nullif(p.display_name, ''), nullif(p.full_name, ''), 'Provider') as profile_name
  from public.profile_migrations pm
  join public.profiles p on p.id = pm.profile_id
  left join public.support_tickets st on st.import_migration_id = pm.id
  where st.id is null
), inserted_tickets as (
  insert into public.support_tickets (
    user_id,
    profile_id,
    subject,
    category,
    status,
    priority,
    source,
    import_migration_id
  )
  select
    user_id,
    profile_id,
    'Profile import request',
    'profile',
    'open',
    'medium',
    'profile_import',
    migration_id
  from missing
  on conflict (import_migration_id) where import_migration_id is not null do nothing
  returning id, user_id, import_migration_id
)
insert into public.support_ticket_messages (
  ticket_id,
  sender_id,
  sender_role,
  body,
  external_id
)
select
  it.id,
  it.user_id,
  'provider',
  'Automatic profile import request submitted.' || E'\n\n' ||
  'Provider: ' || m.profile_name || E'\n' ||
  'Source: ' || case
    when m.platform is null or m.platform = '' or m.platform = 'custom' then 'another platform'
    else initcap(replace(m.platform, '_', ' '))
  end || E'\n' ||
  'Profile URL: ' || m.source_url || E'\n' ||
  'Import status: ' || m.status || E'\n' ||
  'Migration ID: ' || m.migration_id::text,
  'profile-import:' || m.migration_id::text
from inserted_tickets it
join missing m on m.migration_id = it.import_migration_id
on conflict do nothing;
