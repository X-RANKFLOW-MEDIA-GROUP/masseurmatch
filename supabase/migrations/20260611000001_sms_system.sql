-- SMS automation system: profiles, logs, and follow-up alerts

-- Per-therapist SMS configuration
CREATE TABLE IF NOT EXISTS public.sms_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Master toggle: when false, no auto-replies are sent
  ready_to_reply BOOLEAN NOT NULL DEFAULT false,
  -- Availability mode
  availability_mode TEXT NOT NULL DEFAULT 'in_city' CHECK (
    availability_mode IN ('in_city', 'traveling', 'arrival_window', 'unavailable')
  ),
  -- For arrival_window mode
  arrival_date DATE,
  departure_date DATE,
  -- Pricing (stored as display strings, e.g. "$150")
  pricing_60 TEXT,
  pricing_90 TEXT,
  pricing_couples TEXT,
  -- Service flags
  outcall_available BOOLEAN NOT NULL DEFAULT false,
  couples_available BOOLEAN NOT NULL DEFAULT false,
  outcall_area TEXT,
  -- Operator alert phone (where to forward complex inquiries)
  alert_phone TEXT,
  -- Custom instructions injected into AI prompt
  custom_instructions TEXT,
  -- Which Twilio number handles this profile
  twilio_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

ALTER TABLE public.sms_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access sms_profiles" ON public.sms_profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Provider manage own sms_profile" ON public.sms_profiles FOR ALL TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE OR REPLACE TRIGGER update_sms_profiles_updated_at
  BEFORE UPDATE ON public.sms_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- SMS message log (both inbound and outbound)
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.sms_profiles(id) ON DELETE SET NULL,
  -- The phone conversation pair
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  twilio_sid TEXT,
  -- Detected intent from the inbound message
  intent TEXT,
  -- Delivery status
  status TEXT DEFAULT 'received' CHECK (
    status IN ('received', 'queued', 'sent', 'delivered', 'failed', 'undelivered')
  ),
  -- Was this manually sent (not AI)?
  is_manual BOOLEAN NOT NULL DEFAULT false,
  -- Linked booking inquiry (if AI routed to booking flow)
  booking_inquiry_id UUID REFERENCES public.booking_inquiries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_profile ON public.sms_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_conversation ON public.sms_logs(from_number, to_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON public.sms_logs(created_at DESC);

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access sms_logs" ON public.sms_logs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Provider read own sms_logs" ON public.sms_logs FOR SELECT TO authenticated
  USING (profile_id IN (
    SELECT sp.id FROM public.sms_profiles sp
    JOIN public.profiles p ON p.id = sp.profile_id
    WHERE p.user_id = auth.uid()
  ));

-- Follow-up alerts: conversations that went silent after our reply
CREATE TABLE IF NOT EXISTS public.sms_follow_up_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.sms_profiles(id) ON DELETE CASCADE,
  -- Conversation identifier
  client_phone TEXT NOT NULL,
  our_phone TEXT NOT NULL,
  -- Timing
  last_outbound_at TIMESTAMPTZ NOT NULL,
  last_inbound_at TIMESTAMPTZ,
  -- Alert state
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, client_phone, our_phone)
);

CREATE INDEX IF NOT EXISTS idx_sms_alerts_profile ON public.sms_follow_up_alerts(profile_id);
CREATE INDEX IF NOT EXISTS idx_sms_alerts_unresolved ON public.sms_follow_up_alerts(resolved_at) WHERE resolved_at IS NULL;

ALTER TABLE public.sms_follow_up_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access sms_follow_up_alerts" ON public.sms_follow_up_alerts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
