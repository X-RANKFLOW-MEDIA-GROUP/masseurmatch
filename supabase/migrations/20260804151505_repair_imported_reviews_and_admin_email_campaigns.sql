-- Repair production environments where the import workflow migration was
-- recorded before imported_reviews.imported_at existed.
-- The same drift left lifecycle_email_queue without the JSON payload used by
-- Admin Email Center. Add it before creating campaign indexes and triggers;
-- the following migration restores the rest of the lifecycle runtime.
alter table public.lifecycle_email_queue
  add column if not exists payload jsonb not null default '{}'::jsonb;

alter table public.imported_reviews
  add column if not exists imported_at timestamptz default now(),
  add column if not exists public_label text not null default 'Imported review';

alter table public.imported_reviews
  alter column imported_at set default now();

update public.imported_reviews
set imported_at = coalesce(created_at, now())
where imported_at is null;

create index if not exists idx_imported_reviews_public_profile_date
  on public.imported_reviews (profile_id, review_date desc)
  where is_public = true;

create or replace view public.public_imported_reviews
with (security_invoker = true) as
select
  ir.id,
  ir.profile_id,
  case
    when coalesce(ir.reviewer_anonymized, false) then null
    else ir.reviewer_name
  end as reviewer_name,
  ir.rating,
  ir.review_text,
  ir.review_date,
  ir.public_label,
  ir.imported_at,
  ir.created_at
from public.imported_reviews ir
where ir.is_public = true;

-- Public profile pages read this projection on the server with the service
-- role. Anonymous access to the base table would expose source URLs and raw
-- reviewer names, so remove that legacy policy and grant only the safe view.
drop policy if exists "Public can view approved imported reviews" on public.imported_reviews;
revoke select on public.imported_reviews from anon;
revoke all on public.public_imported_reviews from public, anon, authenticated;
grant select on public.public_imported_reviews to service_role;

-- Campaign rows are summaries of lifecycle queue rows. Keep the summary in
-- sync whenever the worker claims, retries, sends, suppresses or fails a row.
create index if not exists idx_lifecycle_email_queue_admin_campaign
  on public.lifecycle_email_queue ((payload ->> 'campaign_id'))
  where payload ? 'campaign_id';

create or replace function public.sync_admin_email_campaign_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campaign_id uuid;
begin
  if coalesce(new.payload ->> 'campaign_id', '')
    !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
  then
    return new;
  end if;

  v_campaign_id := (new.payload ->> 'campaign_id')::uuid;

  update public.admin_email_campaigns campaign
  set status = (
        select case
          when count(*) filter (where queue.status = 'processing') > 0 then 'processing'
          when count(*) filter (where queue.status = 'queued') > 0 then
            case
              when min(queue.scheduled_for) filter (where queue.status = 'queued') > now() then 'scheduled'
              else 'processing'
            end
          else 'completed'
        end
        from public.lifecycle_email_queue queue
        where queue.payload ->> 'campaign_id' = v_campaign_id::text
      ),
      updated_at = now()
  where campaign.id = v_campaign_id
    and campaign.status <> 'cancelled';

  return new;
end;
$$;

drop trigger if exists trg_sync_admin_email_campaign_status on public.lifecycle_email_queue;
create trigger trg_sync_admin_email_campaign_status
after insert or update of status, scheduled_for on public.lifecycle_email_queue
for each row execute function public.sync_admin_email_campaign_status();

revoke all on function public.sync_admin_email_campaign_status() from public, anon, authenticated;

-- Reconcile rows created before the trigger existed.
update public.admin_email_campaigns campaign
set status = case
      when exists (
        select 1
        from public.lifecycle_email_queue queue
        where queue.payload ->> 'campaign_id' = campaign.id::text
          and queue.status = 'processing'
      ) then 'processing'
      when exists (
        select 1
        from public.lifecycle_email_queue queue
        where queue.payload ->> 'campaign_id' = campaign.id::text
          and queue.status = 'queued'
      ) then case
        when exists (
          select 1
          from public.lifecycle_email_queue queue
          where queue.payload ->> 'campaign_id' = campaign.id::text
            and queue.status = 'queued'
            and queue.scheduled_for <= now()
        ) then 'processing'
        else 'scheduled'
      end
      else 'completed'
    end,
    updated_at = now()
where campaign.status <> 'cancelled';

-- Trigger functions are internal implementation details, not public RPCs.
-- Remove inherited EXECUTE grants and pin their search paths.
alter function public.set_updated_at() set search_path = '';
alter function public.admin_email_touch_updated_at() set search_path = '';
alter function public.create_profile_import_ticket() set search_path = '';
alter function public.refresh_imported_review_profile_stats() set search_path = '';
alter function public.support_ticket_touch_parent() set search_path = '';
alter function public.sync_profile_import_ticket_status() set search_path = '';
alter function public.sync_profile_verified_photos() set search_path = '';

revoke execute on function public.create_profile_import_ticket() from public, anon, authenticated;
revoke execute on function public.admin_email_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.refresh_imported_review_profile_stats() from public, anon, authenticated;
revoke execute on function public.support_ticket_touch_parent() from public, anon, authenticated;
revoke execute on function public.sync_profile_import_ticket_status() from public, anon, authenticated;
revoke execute on function public.sync_profile_verified_photos() from public, anon, authenticated;

-- Reassert the service-role-only contract for Stripe webhook RPCs. These
-- functions also contain an in-function service-role guard, so this is a
-- second independent boundary.
revoke execute on function public.process_stripe_payment_intent_succeeded(text, uuid) from public, anon, authenticated;
revoke execute on function public.process_stripe_payment_intent_failed(text) from public, anon, authenticated;
revoke execute on function public.process_stripe_identity_verified(text, uuid) from public, anon, authenticated;
revoke execute on function public.process_stripe_identity_requires_input(text, text) from public, anon, authenticated;

grant execute on function public.process_stripe_payment_intent_succeeded(text, uuid) to service_role;
grant execute on function public.process_stripe_payment_intent_failed(text) to service_role;
grant execute on function public.process_stripe_identity_verified(text, uuid) to service_role;
grant execute on function public.process_stripe_identity_requires_input(text, text) to service_role;
