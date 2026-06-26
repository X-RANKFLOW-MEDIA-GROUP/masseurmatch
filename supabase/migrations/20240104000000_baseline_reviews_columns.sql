-- The reviews table is created by 20260314_directory_schema with a minimal schema
-- (therapist_id, author_name, rating, body, status). Later migrations add indexes
-- on columns that don't exist yet. Add them here with ADD COLUMN IF NOT EXISTS.

alter table public.reviews
  add column if not exists client_id       uuid references auth.users(id) on delete cascade,
  add column if not exists client_email    text,
  add column if not exists reviewer_name  text,
  add column if not exists title          text,
  add column if not exists content        text,
  add column if not exists review_text    text,
  add column if not exists review_date    date,
  add column if not exists source_platform text,
  add column if not exists is_verified    boolean default false,
  add column if not exists is_public      boolean default true,
  add column if not exists helpful_count  integer default 0;
