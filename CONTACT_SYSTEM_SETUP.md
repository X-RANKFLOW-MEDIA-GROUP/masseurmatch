# Contact System Setup Guide

The contact system for MasseurMatch has been fully implemented. Follow these steps to complete the setup:

## Step 1: Execute Database Migration

The contact system requires two new tables in Supabase. Execute this SQL in your Supabase SQL Editor:

```sql
-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  message TEXT NOT NULL,
  contact_method VARCHAR(50) NOT NULL CHECK (contact_method IN ('email', 'phone', 'whatsapp', 'contact-form')),
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'responded', 'archived')),
  therapist_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_preferences table
CREATE TABLE IF NOT EXISTS public.contact_preferences (
  id BIGSERIAL PRIMARY KEY,
  therapist_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_email BOOLEAN DEFAULT true,
  allow_phone BOOLEAN DEFAULT true,
  allow_whatsapp BOOLEAN DEFAULT true,
  auto_reply_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contact_inquiries
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow therapists to see their own inquiries
CREATE POLICY "therapists_can_view_own_inquiries" ON public.contact_inquiries
  FOR SELECT
  USING (auth.uid() = therapist_id);

-- Allow therapists to update their own inquiries
CREATE POLICY "therapists_can_update_own_inquiries" ON public.contact_inquiries
  FOR UPDATE
  USING (auth.uid() = therapist_id);

-- Allow anyone to create inquiries
CREATE POLICY "anyone_can_create_inquiries" ON public.contact_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on contact_preferences
ALTER TABLE public.contact_preferences ENABLE ROW LEVEL SECURITY;

-- Allow therapists to view their own preferences
CREATE POLICY "therapists_can_view_own_preferences" ON public.contact_preferences
  FOR SELECT
  USING (auth.uid() = therapist_id);

-- Allow therapists to update their own preferences
CREATE POLICY "therapists_can_update_own_preferences" ON public.contact_preferences
  FOR UPDATE
  USING (auth.uid() = therapist_id);

-- Allow therapists to insert their own preferences
CREATE POLICY "therapists_can_insert_preferences" ON public.contact_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = therapist_id);

-- Create indexes for performance
CREATE INDEX idx_contact_inquiries_therapist_id ON public.contact_inquiries(therapist_id);
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX idx_contact_preferences_therapist_id ON public.contact_preferences(therapist_id);
```

### How to Execute:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (MasseurMatch)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Paste the SQL above
6. Click **Run**

## Step 2: Configure Environment Variables

Ensure these environment variables are set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
RESEND_API_KEY=your_resend_api_key
```

## Step 3: Features Enabled

Once the database tables are created, these features are active:

### For Clients:
- Contact form on therapist profiles (`/therapists/[slug]`)
- Direct email link: `mailto:therapist@example.com`
- Direct phone link: `tel:+1234567890`
- WhatsApp message link: `https://wa.me/1234567890`

### For Therapists:
- **Inquiries Dashboard** at `/pro/inquiries` - View all client inquiries
- **Contact Preferences** at `/pro/contact-preferences` - Control which contact methods are available
- Email notifications when inquiries arrive (via Resend)
- Ability to mark inquiries as viewed/responded/archived
- Notes field for managing leads

## Step 4: Verify Setup

Test the system:

1. Go to a therapist profile page: `/therapists/[slug]`
2. Scroll to the contact section
3. Click "Send Message" to open the contact form
4. Fill in and submit
5. Check `/pro/inquiries` for the new inquiry
6. Verify email notification was sent

## Troubleshooting

**Issue**: Contact form not working
- Check if RESEND_API_KEY is set in Vercel
- Verify tables were created in Supabase SQL Editor

**Issue**: Inquiries not appearing
- Ensure you're logged in as a therapist
- Check Supabase RLS policies are correctly applied
- Verify the therapist_id matches the logged-in user

**Issue**: Email notifications not received
- Check Resend dashboard for failed sends
- Verify therapist email is correct in Supabase auth
- Check spam folder

## API Endpoints

The following API routes handle contact operations:

- `POST /api/contact/inquiries` - Create new inquiry
- `GET /api/email/send` - Send notification emails

## Files Added

- `/src/components/contact/ContactForm.tsx` - Contact form component
- `/src/app/therapists/[slug]/_components/PremiumProfileContact.tsx` - Profile contact section
- `/src/app/pro/inquiries/page.tsx` - Inquiries dashboard
- `/src/app/pro/contact-preferences/page.tsx` - Preferences settings
- `/src/app/api/contact/inquiries/route.ts` - Contact API
- `/src/app/api/email/send/route.ts` - Email API
- `supabase/migrations/20260409000000_contact_system.sql` - Database migration

All features are production-ready and integrated into the existing MasseurMatch platform.
