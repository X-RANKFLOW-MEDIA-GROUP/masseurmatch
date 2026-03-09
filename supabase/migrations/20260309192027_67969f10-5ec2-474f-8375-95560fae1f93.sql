
-- Table for imported external reviews
CREATE TABLE public.imported_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_platform text, -- e.g. "Yelp", "Google", "MassageBook"
  reviewer_name text,
  review_text text NOT NULL,
  rating numeric(2,1), -- e.g. 4.5
  review_date text, -- original date as text
  imported_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for AI-generated profile summary from external sources
CREATE TABLE public.imported_profile_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_platform text,
  ai_summary text, -- AI-generated summary of reviews
  extracted_bio text,
  extracted_specialties text[],
  extracted_rating_avg numeric(2,1),
  extracted_review_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.imported_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_profile_data ENABLE ROW LEVEL SECURITY;

-- Owners can manage their imported reviews
CREATE POLICY "Owners can manage imported reviews"
  ON public.imported_reviews FOR ALL TO authenticated
  USING (is_profile_owner(profile_id))
  WITH CHECK (is_profile_owner(profile_id));

-- Public can view imported reviews for active profiles
CREATE POLICY "Public can view imported reviews"
  ON public.imported_reviews FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = imported_reviews.profile_id
    AND p.is_active = true
  ));

-- Admins can manage all imported reviews
CREATE POLICY "Admins manage imported reviews"
  ON public.imported_reviews FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Owners can manage their imported profile data
CREATE POLICY "Owners can manage imported profile data"
  ON public.imported_profile_data FOR ALL TO authenticated
  USING (is_profile_owner(profile_id))
  WITH CHECK (is_profile_owner(profile_id));

-- Admins can manage all imported profile data
CREATE POLICY "Admins manage imported profile data"
  ON public.imported_profile_data FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
