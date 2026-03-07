
-- Contact preferences: which methods the provider accepts, and whether to share email publicly
ALTER TABLE public.profiles 
  ADD COLUMN contact_methods text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN share_email boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.contact_methods IS 'Accepted contact methods: call, text, email, whatsapp';
COMMENT ON COLUMN public.profiles.share_email IS 'Whether to display email on public profile';
