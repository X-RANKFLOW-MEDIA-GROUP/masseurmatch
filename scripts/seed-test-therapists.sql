-- Seed 5 therapists for testing (adapted to actual schema)
-- Assumes 'profiles' and 'therapists' tables exist with columns as per latest migrations

DO $$
DECLARE
  t1_id UUID := gen_random_uuid();
  t2_id UUID := gen_random_uuid();
  t3_id UUID := gen_random_uuid();
  t4_id UUID := gen_random_uuid();
  t5_id UUID := gen_random_uuid();
BEGIN
  -- Insert into therapists (directory listing)
  INSERT INTO public.therapists (id, slug, modalities, tier, status, view_count)
  VALUES
    (t1_id, 'marcus-donovan', ARRAY['Deep Tissue','Sports'], 'standard', 'active', 0),
    (t2_id, 'julian-silva', ARRAY['Swedish','Relaxation'], 'standard', 'active', 0),
    (t3_id, 'david-lee', ARRAY['Deep Tissue','Gay Massage'], 'standard', 'active', 0),
    (t4_id, 'alex-rivera', ARRAY['Sports','Male Massage'], 'standard', 'active', 0),
    (t5_id, 'sam-taylor', ARRAY['Relaxation','Gay Massage'], 'standard', 'active', 0);

  -- Insert into profiles (therapist personal info)
  INSERT INTO public.profiles (
    id, role, display_name, city, state, specialties, incall_price, outcall_price, available_now, language_pref, location_lat_long
  ) VALUES
    (t1_id, 'therapist', 'Marcus Donovan', 'Dallas', 'TX', ARRAY['Deep Tissue','Out-call','Sports'], 120, 150, true, 'en', ST_Point(-96.7970, 32.7767)::geography),
    (t2_id, 'therapist', 'Julian Silva', 'Austin', 'TX', ARRAY['Relaxation','In-call','Swedish'], 150, 180, false, 'en', ST_Point(-97.7431, 30.2672)::geography),
    (t3_id, 'therapist', 'David Lee', 'Houston', 'TX', ARRAY['Deep Tissue','Gay Massage','Out-call'], 100, 130, true, 'en', ST_Point(-95.3698, 29.7604)::geography),
    (t4_id, 'therapist', 'Alex Rivera', 'Dallas', 'TX', ARRAY['Sports','Male Massage','In-call'], 130, 160, false, 'en', ST_Point(-96.8000, 32.7800)::geography),
    (t5_id, 'therapist', 'Sam Taylor', 'Dallas', 'TX', ARRAY['Relaxation','Gay Massage','Out-call'], 140, 170, true, 'en', ST_Point(-96.7900, 32.7700)::geography);
END $$;
