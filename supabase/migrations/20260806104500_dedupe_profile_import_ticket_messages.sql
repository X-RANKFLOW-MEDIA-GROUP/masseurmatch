-- Prevent duplicate automated profile-import messages for the same migration.

-- Keep the earliest message for each profile-import external ID.
with ranked as (
  select
    id,
    row_number() over (
      partition by external_id
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.support_ticket_messages
  where external_id like 'profile-import:%'
)
delete from public.support_ticket_messages message
using ranked
where message.id = ranked.id
  and ranked.duplicate_rank > 1;

create unique index if not exists support_ticket_messages_profile_import_external_id_uidx
  on public.support_ticket_messages(external_id)
  where external_id like 'profile-import:%';

-- Recreate the import-ticket trigger with message-level idempotency as a
-- second line of defense if a migration event is replayed.
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
  v_external_id text := 'profile-import:' || new.id::text;
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
    user_id, profile_id, subject, category, status, priority, source, import_migration_id
  ) values (
    v_user_id, new.profile_id, 'Profile import request', 'profile', 'open', 'medium',
    'profile_import', new.id
  )
  on conflict (import_migration_id) where import_migration_id is not null do update
    set updated_at = public.support_tickets.updated_at
  returning id into v_ticket_id;

  insert into public.support_ticket_messages (
    ticket_id, sender_id, sender_role, body, external_id
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
    v_external_id
  )
  on conflict (external_id) where external_id like 'profile-import:%' do nothing;

  return new;
end;
$$;
