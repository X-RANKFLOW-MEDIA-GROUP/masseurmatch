ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT false;
