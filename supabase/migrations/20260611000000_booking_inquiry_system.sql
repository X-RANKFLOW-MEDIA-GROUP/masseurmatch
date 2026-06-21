-- Ensure the updated_at helper exists before any table that uses it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Booking inquiry system: tracks massage inquiries from first contact through approval
CREATE TABLE IF NOT EXISTS public.booking_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Client identity
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  client_hotel TEXT,
  -- What they want
  service_type TEXT DEFAULT 'massage',
  preferred_date DATE,
  preferred_time TEXT,
  duration_minutes INTEGER DEFAULT 60,
  message TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('website','sms','whatsapp','direct')),
  -- Which therapist this is for (null = unassigned)
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Lifecycle status
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new','checking','pending_approval','approved','denied','completed','cancelled')
  ),
  -- Background intelligence
  intelligence_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    intelligence_status IN ('pending','running','clean','flagged','inconclusive')
  ),
  intelligence_report JSONB DEFAULT '{}',
  -- AI conversation history: [{role:'user'|'assistant', content:'...'}]
  ai_conversation JSONB DEFAULT '[]',
  -- Slot the client selected
  confirmed_date DATE,
  confirmed_time TEXT,
  -- Linked appointment (created on approval)
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  -- Google Sheets row reference
  sheets_row_id TEXT,
  -- Admin review
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_inquiries_therapist ON public.booking_inquiries(therapist_id);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON public.booking_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_created ON public.booking_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_phone ON public.booking_inquiries(client_phone);

ALTER TABLE public.booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admin full access booking_inquiries"
  ON public.booking_inquiries FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Providers: read inquiries directed at them
CREATE POLICY "Provider read own booking_inquiries"
  ON public.booking_inquiries FOR SELECT
  TO authenticated
  USING (
    therapist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Anyone can submit a new inquiry (no auth required)
CREATE POLICY "Public insert booking_inquiries"
  ON public.booking_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- updated_at trigger (reuses the existing function)
CREATE OR REPLACE TRIGGER update_booking_inquiries_updated_at
  BEFORE UPDATE ON public.booking_inquiries
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
