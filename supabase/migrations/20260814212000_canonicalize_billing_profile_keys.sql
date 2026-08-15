-- Canonicalize provider billing on public.profiles.id while retaining the
-- historical therapist_profile_id column as an optional compatibility field.

alter table public.therapist_subscriptions
  alter column therapist_profile_id drop not null;

-- Backfill any legacy subscription that can be mapped safely.
update public.therapist_subscriptions ts
set profile_id = tp.profile_id
from public.therapist_profiles tp
where ts.profile_id is null
  and ts.therapist_profile_id = tp.id
  and tp.profile_id is not null;

create unique index if not exists uq_therapist_subscriptions_profile_id
  on public.therapist_subscriptions(profile_id);

alter table public.therapist_subscriptions
  drop constraint if exists therapist_subscriptions_profile_identity_check;

alter table public.therapist_subscriptions
  add constraint therapist_subscriptions_profile_identity_check
  check (profile_id is not null or therapist_profile_id is not null);

create index if not exists idx_checkout_sessions_profile_created
  on public.checkout_sessions(profile_id, created_at desc);
