-- Create contact inquiries table
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_phone text,
  message text not null,
  preferred_contact text not null default 'email' check (preferred_contact in ('email', 'phone', 'whatsapp')),
  status text not null default 'new' check (status in ('new', 'viewed', 'responded', 'archived')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create contact preferences table
create table if not exists public.contact_preferences (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null unique references public.therapists (id) on delete cascade,
  allow_phone boolean not null default true,
  allow_email boolean not null default true,
  allow_whatsapp boolean not null default false,
  auto_reply_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create indexes
create index if not exists idx_contact_inquiries_therapist on public.contact_inquiries(therapist_id);
create index if not exists idx_contact_inquiries_status on public.contact_inquiries(status);
create index if not exists idx_contact_inquiries_created on public.contact_inquiries(created_at);
create index if not exists idx_contact_preferences_therapist on public.contact_preferences(therapist_id);

-- Add triggers for updated_at
create trigger set_contact_inquiries_updated_at
  before update on public.contact_inquiries
  for each row
  execute function public.set_updated_at();

create trigger set_contact_preferences_updated_at
  before update on public.contact_preferences
  for each row
  execute function public.set_updated_at();

-- Enable RLS
alter table public.contact_inquiries enable row level security;
alter table public.contact_preferences enable row level security;

-- RLS: Anyone can insert inquiries (for public form submissions)
create policy "contact_inquiries_insert_public"
  on public.contact_inquiries for insert
  with check (true);

-- RLS: Therapists can view their own inquiries
create policy "contact_inquiries_select_own"
  on public.contact_inquiries for select
  using (
    exists (
      select 1 from public.therapists
      where id = contact_inquiries.therapist_id
      and user_id = auth.uid()
    )
  );

-- RLS: Therapists can update their own inquiries
create policy "contact_inquiries_update_own"
  on public.contact_inquiries for update
  using (
    exists (
      select 1 from public.therapists
      where id = contact_inquiries.therapist_id
      and user_id = auth.uid()
    )
  );

-- RLS: Therapists can manage their contact preferences
create policy "contact_preferences_all_own"
  on public.contact_preferences for all
  using (
    exists (
      select 1 from public.therapists
      where id = contact_preferences.therapist_id
      and user_id = auth.uid()
    )
  );
