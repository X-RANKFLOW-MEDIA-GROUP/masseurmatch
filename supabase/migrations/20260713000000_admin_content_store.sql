-- Durable storage for admin-editable content (blog posts, city intros,
-- keywords). Previously this lived in os.tmpdir() + an in-memory cache, so
-- edits vanished on serverless cold starts and were never shared across
-- instances. A singleton row keyed by 'singleton' mirrors the site_settings
-- pattern and matches the ContentStore shape used by the app.

create table if not exists public.admin_content (
  id          text primary key default 'singleton',
  blog_posts  jsonb not null default '[]'::jsonb,
  cities      jsonb not null default '[]'::jsonb,
  keywords    jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Ensure the singleton row exists.
insert into public.admin_content (id)
values ('singleton')
on conflict (id) do nothing;

-- Service-role only: all reads/writes go through server-side admin routes that
-- already gate on requireAdminSession. Enable RLS with no policies so the anon
-- and authenticated roles cannot touch it directly.
alter table public.admin_content enable row level security;
