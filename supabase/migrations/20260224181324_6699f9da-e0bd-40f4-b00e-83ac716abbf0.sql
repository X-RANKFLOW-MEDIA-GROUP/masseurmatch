
-- Travel table for providers visiting other cities
CREATE TABLE public.provider_travel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_city TEXT NOT NULL,
  destination_state TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for querying active travel by date range
CREATE INDEX idx_provider_travel_dates ON public.provider_travel (destination_city, start_date, end_date) WHERE is_active = true;
CREATE INDEX idx_provider_travel_profile ON public.provider_travel (profile_id);

-- Enable RLS
ALTER TABLE public.provider_travel ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own travel
CREATE POLICY "Providers can view their own travel"
ON public.provider_travel FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_id AND profiles.user_id = auth.uid()));

CREATE POLICY "Providers can insert their own travel"
ON public.provider_travel FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_id AND profiles.user_id = auth.uid()));

CREATE POLICY "Providers can update their own travel"
ON public.provider_travel FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_id AND profiles.user_id = auth.uid()));

CREATE POLICY "Providers can delete their own travel"
ON public.provider_travel FOR DELETE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_id AND profiles.user_id = auth.uid()));

-- Public can view active travel (for explore page matching)
CREATE POLICY "Public can view active travel"
ON public.provider_travel FOR SELECT
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_provider_travel_updated_at
BEFORE UPDATE ON public.provider_travel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger: end_date must be after start_date
CREATE OR REPLACE FUNCTION public.validate_travel_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date <= NEW.start_date THEN
    RAISE EXCEPTION 'end_date must be after start_date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_travel_dates_trigger
BEFORE INSERT OR UPDATE ON public.provider_travel
FOR EACH ROW
EXECUTE FUNCTION public.validate_travel_dates();
