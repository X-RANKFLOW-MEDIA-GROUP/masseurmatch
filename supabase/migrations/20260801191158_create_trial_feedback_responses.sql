create table if not exists public.trial_feedback_responses (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null,
  overall_rating text not null,
  profile_experience text not null,
  most_useful text not null,
  problems_or_missing text,
  seo_understanding text not null,
  continue_likelihood text not null,
  improvement_request text,
  contact_requested boolean not null default false,
  preferred_contact_method text,
  phone text,
  best_contact_time text,
  additional_comments text,
  confidentiality_acknowledged boolean not null default true,
  ip_hash text,
  user_agent text,
  email_notification_status text not null default 'pending',
  email_notification_id text,
  email_notified_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint trial_feedback_contact_details_check check (
    contact_requested = false or (
      preferred_contact_method is not null and
      phone is not null and
      best_contact_time is not null
    )
  )
);

alter table public.trial_feedback_responses enable row level security;

comment on table public.trial_feedback_responses is 'Confidential MasseurMatch trial questionnaire responses. Service-role access only.';

create index if not exists trial_feedback_responses_created_at_idx on public.trial_feedback_responses (created_at desc);
create index if not exists trial_feedback_responses_contact_requested_idx on public.trial_feedback_responses (contact_requested, created_at desc);
