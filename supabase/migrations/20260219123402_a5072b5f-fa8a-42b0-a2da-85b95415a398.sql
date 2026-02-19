
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'provider');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'provider',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'processing', 'verified', 'failed', 'expired');

-- Photo moderation status enum  
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table with all premium fields
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  display_name TEXT,
  bio TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'BR',
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  incall_price NUMERIC(10,2),
  outcall_price NUMERIC(10,2),
  business_hours JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  presentation_video_url TEXT,
  custom_faq JSONB DEFAULT '[]',
  service_areas JSONB DEFAULT '[]',
  avatar_url TEXT,
  is_verified_identity BOOLEAN NOT NULL DEFAULT false,
  is_verified_photos BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT false,
  stripe_verification_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Stripe identity verifications tracking
CREATE TABLE public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  stripe_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Profile photos with moderation
CREATE TABLE public.profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  moderation_status moderation_status NOT NULL DEFAULT 'pending',
  moderation_reason TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

-- ============ HELPER FUNCTIONS ============

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_profile_owner(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _profile_id AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_identity_verifications_updated_at
  BEFORE UPDATE ON public.identity_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'provider');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active verified profiles"
  ON public.profiles FOR SELECT
  USING (
    (is_active = true AND is_verified_identity = true AND is_verified_photos = true)
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own verifications"
  ON public.identity_verifications FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own verifications"
  ON public.identity_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own or active profile photos"
  ON public.profile_photos FOR SELECT
  USING (
    public.is_profile_owner(profile_id)
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id AND p.is_active = true
      AND p.is_verified_identity = true AND p.is_verified_photos = true
    )
  );

CREATE POLICY "Users can upload own photos"
  ON public.profile_photos FOR INSERT
  WITH CHECK (public.is_profile_owner(profile_id));

CREATE POLICY "Users can update own photos"
  ON public.profile_photos FOR UPDATE
  USING (public.is_profile_owner(profile_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own photos"
  ON public.profile_photos FOR DELETE
  USING (public.is_profile_owner(profile_id) OR public.has_role(auth.uid(), 'admin'));
