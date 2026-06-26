-- The reviews table is created by 20260314_directory_schema with a minimal schema
-- (therapist_id, author_name, rating, body, status). Later migrations add indexes
-- on columns that don't exist yet. Add them here with ADD COLUMN IF NOT EXISTS.

DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL THEN
    ALTER TABLE public.reviews
      ADD COLUMN IF NOT EXISTS client_id       uuid references auth.users(id) on delete cascade,
      ADD COLUMN IF NOT EXISTS client_email    text,
      ADD COLUMN IF NOT EXISTS reviewer_name  text,
      ADD COLUMN IF NOT EXISTS title          text,
      ADD COLUMN IF NOT EXISTS content        text,
      ADD COLUMN IF NOT EXISTS review_text    text,
      ADD COLUMN IF NOT EXISTS review_date    date,
      ADD COLUMN IF NOT EXISTS source_platform text,
      ADD COLUMN IF NOT EXISTS is_verified    boolean default false,
      ADD COLUMN IF NOT EXISTS is_public      boolean default true,
      ADD COLUMN IF NOT EXISTS helpful_count  integer default 0;
  END IF;
END $$;
