create table if not exists public.bruno_conversations (
  id bigint generated always as identity primary key,
  phone text,
  inbound text,
  reply text,
  created_at timestamptz not null default now()
);

alter table public.bruno_conversations enable row level security;

-- anon can only INSERT (write-only); it cannot read conversations.
grant insert on public.bruno_conversations to anon;
grant usage, select on sequence public.bruno_conversations_id_seq to anon;

drop policy if exists "anon insert conversations" on public.bruno_conversations;
create policy "anon insert conversations"
  on public.bruno_conversations
  for insert
  to anon
  with check (true);
