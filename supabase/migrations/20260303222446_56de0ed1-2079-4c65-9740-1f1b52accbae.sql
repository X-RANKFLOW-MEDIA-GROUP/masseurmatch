CREATE INDEX IF NOT EXISTS idx_profiles_city_active ON public.profiles (city) WHERE is_active = true AND is_verified_identity = true AND is_verified_photos = true;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_profile_photos_profile_id ON public.profile_photos (profile_id) WHERE moderation_status = 'approved';

CREATE INDEX IF NOT EXISTS idx_provider_travel_profile_active ON public.provider_travel (profile_id) WHERE is_active = true;