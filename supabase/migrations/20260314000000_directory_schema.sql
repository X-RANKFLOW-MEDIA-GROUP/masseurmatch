create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'therapist' check (role in ('admin', 'therapist')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  state text not null,
  state_code text not null,
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  hero text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.keywords (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  category text not null check (category in ('modality', 'identity', 'intent')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  slug text not null unique,
  display_name text not null,
  city_id uuid not null references public.cities (id) on delete restrict,
  state text not null,
  bio text not null,
  photo_url text not null,
  gallery jsonb not null default '[]'::jsonb,
  modalities text[] not null default '{}'::text[],
  keyword_slugs text[] not null default '{}'::text[],
  languages text[] not null default '{}'::text[],
  contact_email text not null,
  phone text not null,
  website text not null,
  incall boolean not null default true,
  outcall boolean not null default false,
  price_range text not null,
  gay_friendly boolean not null default false,
  inclusive boolean not null default true,
  segments text[] not null default '{}'::text[],
  latitude double precision not null,
  longitude double precision not null,
  tier text not null default 'free' check (tier in ('free', 'pro', 'featured')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'approved', 'suspended')),
  view_count integer not null default 0,
  profile_completeness integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid not null references public.therapists (id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'removed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  seo_description text not null,
  content text not null,
  tags text[] not null default '{}'::text[],
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro', 'featured')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_cities_name on public.cities (name);
create index if not exists idx_keywords_category on public.keywords (category);
create index if not exists idx_therapists_city_id on public.therapists (city_id);
create index if not exists idx_therapists_status on public.therapists (status);
create index if not exists idx_therapists_tier on public.therapists (tier);
create index if not exists idx_therapists_user_id on public.therapists (user_id);
create index if not exists idx_therapists_view_count on public.therapists (view_count desc);
create index if not exists idx_reviews_therapist_id on public.reviews (therapist_id);
create index if not exists idx_reviews_status on public.reviews (status);
create index if not exists idx_blog_posts_published_at on public.blog_posts (published_at desc);
create index if not exists idx_subscriptions_status on public.subscriptions (status);
create index if not exists idx_therapists_modalities on public.therapists using gin (modalities);
create index if not exists idx_therapists_keyword_slugs on public.therapists using gin (keyword_slugs);
create index if not exists idx_therapists_segments on public.therapists using gin (segments);

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists trg_cities_set_updated_at on public.cities;
create trigger trg_cities_set_updated_at before update on public.cities for each row execute function public.set_updated_at();

drop trigger if exists trg_keywords_set_updated_at on public.keywords;
create trigger trg_keywords_set_updated_at before update on public.keywords for each row execute function public.set_updated_at();

drop trigger if exists trg_therapists_set_updated_at on public.therapists;
create trigger trg_therapists_set_updated_at before update on public.therapists for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_set_updated_at on public.reviews;
create trigger trg_reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_set_updated_at on public.blog_posts;
create trigger trg_blog_posts_set_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_set_updated_at on public.subscriptions;
create trigger trg_subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data ->> 'role', 'therapist')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_auth_user();

alter table public.users enable row level security;
alter table public.cities enable row level security;
alter table public.keywords enable row level security;
alter table public.therapists enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin" on public.users for select using (id = auth.uid() or public.is_admin());
drop policy if exists "users_insert_self_or_admin" on public.users;
create policy "users_insert_self_or_admin" on public.users for insert with check (id = auth.uid() or public.is_admin());
drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin" on public.users for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin" on public.users for delete using (public.is_admin());

drop policy if exists "cities_public_read" on public.cities;
create policy "cities_public_read" on public.cities for select using (true);
drop policy if exists "cities_admin_manage" on public.cities;
create policy "cities_admin_manage" on public.cities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "keywords_public_read" on public.keywords;
create policy "keywords_public_read" on public.keywords for select using (true);
drop policy if exists "keywords_admin_manage" on public.keywords;
create policy "keywords_admin_manage" on public.keywords for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "therapists_public_read_approved" on public.therapists;
create policy "therapists_public_read_approved" on public.therapists for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
drop policy if exists "therapists_insert_self_or_admin" on public.therapists;
create policy "therapists_insert_self_or_admin" on public.therapists for insert with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "therapists_update_self_or_admin" on public.therapists;
create policy "therapists_update_self_or_admin" on public.therapists for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "therapists_delete_admin" on public.therapists;
create policy "therapists_delete_admin" on public.therapists for delete using (public.is_admin());

drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved" on public.reviews for select using (status = 'approved' or public.is_admin());
drop policy if exists "reviews_admin_manage" on public.reviews;
create policy "reviews_admin_manage" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts for select using (true);
drop policy if exists "blog_posts_admin_manage" on public.blog_posts;
create policy "blog_posts_admin_manage" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscriptions_select_self_or_admin" on public.subscriptions;
create policy "subscriptions_select_self_or_admin" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "subscriptions_insert_self_or_admin" on public.subscriptions;
create policy "subscriptions_insert_self_or_admin" on public.subscriptions for insert with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "subscriptions_update_self_or_admin" on public.subscriptions;
create policy "subscriptions_update_self_or_admin" on public.subscriptions for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('therapist-photos', 'therapist-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can read therapist photos" on storage.objects;
create policy "Public can read therapist photos" on storage.objects for select using (bucket_id = 'therapist-photos');
drop policy if exists "Authenticated can upload therapist photos" on storage.objects;
create policy "Authenticated can upload therapist photos" on storage.objects for insert to authenticated with check (bucket_id = 'therapist-photos');
drop policy if exists "Authenticated can update therapist photos" on storage.objects;
create policy "Authenticated can update therapist photos" on storage.objects for update to authenticated using (bucket_id = 'therapist-photos') with check (bucket_id = 'therapist-photos');
drop policy if exists "Authenticated can delete therapist photos" on storage.objects;
create policy "Authenticated can delete therapist photos" on storage.objects for delete to authenticated using (bucket_id = 'therapist-photos');
