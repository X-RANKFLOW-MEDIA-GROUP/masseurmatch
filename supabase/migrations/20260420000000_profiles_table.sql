-- Profiles table - links auth.users to therapist profiles
-- This is the missing table causing "Database error saving new user"

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email text,
  full_name text,
  display_name text,
  phone text,
  
  -- Profile details
  bio text,
  photo_url text,
  city text,
  state text,
  country text DEFAULT 'US',
  
  -- Therapist-specific fields
  specialties text[] DEFAULT '{}',
  modalities text[] DEFAULT '{}',
  languages text[] DEFAULT '{English}',
  
  -- Service options
  incall boolean DEFAULT true,
  outcall boolean DEFAULT false,
  traveling boolean DEFAULT false,
  visiting boolean DEFAULT false,
  
  -- Pricing
  price_min integer,
  price_max integer,
  session_duration integer DEFAULT 60,
  
  -- Availability
  available_now boolean DEFAULT false,
  
  -- Verification status
  is_verified_identity boolean DEFAULT false,
  is_verified_email boolean DEFAULT false,
  is_verified_phone boolean DEFAULT false,
  
  -- Subscription
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'pro', 'elite')),
  subscription_status text DEFAULT 'active',
  stripe_customer_id text,
  
  -- Profile status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'suspended', 'rejected')),
  profile_completeness integer DEFAULT 0,
  
  -- Stats
  view_count integer DEFAULT 0,
  inquiry_count integer DEFAULT 0,
  review_count integer DEFAULT 0,
  average_rating numeric(3,2),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  approved_at timestamptz,
  last_active_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_available_now ON public.profiles(available_now) WHERE available_now = true;
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(is_verified_identity) WHERE is_verified_identity = true;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "profiles_select_public_approved" ON public.profiles;
CREATE POLICY "profiles_select_public_approved" 
  ON public.profiles FOR SELECT 
  USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" 
  ON public.profiles FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" 
  ON public.profiles FOR UPDATE 
  USING (user_id = auth.uid() OR public.is_admin()) 
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" 
  ON public.profiles FOR DELETE 
  USING (public.is_admin());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_set_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
