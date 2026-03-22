alter table public.moderation_queue
  add column if not exists target_id text;

create index if not exists idx_moderation_queue_target_status
  on public.moderation_queue (target_id, status, created_at desc);

drop index if exists public.idx_moderation_queue_pending_profile_source;

create unique index if not exists idx_moderation_queue_pending_target_source
  on public.moderation_queue (item_type, source, coalesce(target_id, profile_id::text))
  where status = 'pending';
