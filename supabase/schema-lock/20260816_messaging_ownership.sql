-- Production schema-lock extension: admin messaging ownership.
--
-- The live messaging tables require user_id. Keep this additive for databases
-- provisioned from older schema-lock snapshots while preserving the stricter
-- NOT NULL contract when the tables are empty or already compliant.

alter table public.messaging_contacts
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.messaging_conversations
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.messaging_messages
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.messaging_queue
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

do $$
begin
  if exists (select 1 from public.messaging_contacts where user_id is null) then
    raise exception 'messaging_contacts.user_id contains NULL rows; ownership must be repaired before enforcing NOT NULL';
  end if;
  if exists (select 1 from public.messaging_conversations where user_id is null) then
    raise exception 'messaging_conversations.user_id contains NULL rows; ownership must be repaired before enforcing NOT NULL';
  end if;
  if exists (select 1 from public.messaging_messages where user_id is null) then
    raise exception 'messaging_messages.user_id contains NULL rows; ownership must be repaired before enforcing NOT NULL';
  end if;
  if exists (select 1 from public.messaging_queue where user_id is null) then
    raise exception 'messaging_queue.user_id contains NULL rows; ownership must be repaired before enforcing NOT NULL';
  end if;
end
$$;

alter table public.messaging_contacts alter column user_id set not null;
alter table public.messaging_conversations alter column user_id set not null;
alter table public.messaging_messages alter column user_id set not null;
alter table public.messaging_queue alter column user_id set not null;
