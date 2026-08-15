-- The admin CSV contact import writes `source` (which import produced the row)
-- and `metadata` (per-row extras such as the drafted text message). Neither
-- column existed on messaging_contacts, so every import insert/update failed
-- against PostgREST with an unknown-column error.
alter table public.messaging_contacts
  add column if not exists source text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
