
-- Add pricing_sessions JSONB column to store multiple session durations with prices
-- Format: [{ "duration": 30, "incall_price": 100, "outcall_price": 150 }, ...]
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pricing_sessions jsonb DEFAULT '[]'::jsonb;

-- Add zip_code column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code text;
