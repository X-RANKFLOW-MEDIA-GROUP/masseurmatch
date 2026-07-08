-- Keyword trends and insights tables for Market Intelligence Dashboard

create table if not exists public.keyword_trends (
  id uuid default gen_random_uuid() primary key,
  keyword text not null,
  search_volume int,
  competition_level text,
  city text,
  state text,
  trend_direction text,
  week int,
  year int,
  date date,
  score int,
  week_over_week_change decimal(5, 2),
  peak_detected boolean default false,
  created_at timestamptz default now(),
  unique(keyword, city, state, week, year)
);

create table if not exists public.keyword_insights (
  id uuid default gen_random_uuid() primary key,
  keyword text not null,
  total_searches int,
  avg_competition decimal(5, 2),
  top_cities text[],
  recommendation text,
  status text,
  created_at timestamptz default now(),
  last_updated timestamptz default now()
);

create index if not exists idx_keyword_trends_keyword on public.keyword_trends(keyword, created_at);
create index if not exists idx_keyword_trends_city on public.keyword_trends(city, state, created_at);
create index if not exists idx_keyword_insights_keyword on public.keyword_insights(keyword);

-- Enable Row Level Security
alter table public.keyword_trends enable row level security;
alter table public.keyword_insights enable row level security;

-- RLS Policies: Only allow reads from authenticated users
create policy if not exists "allow_read_keyword_trends" on public.keyword_trends
  for select using (auth.role() = 'authenticated');

create policy if not exists "allow_read_keyword_insights" on public.keyword_insights
  for select using (auth.role() = 'authenticated');

-- Allow inserts from service role
grant insert on public.keyword_trends to anon, authenticated;
grant insert on public.keyword_insights to anon, authenticated;
