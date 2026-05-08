import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://placeholder.supabase.invalid',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      therapistId,
      clientName,
      clientEmail,
      clientPhone,
      message,
      preferredContact,
    } = body;

    // Validate input
    if (!therapistId || !clientName || !clientEmail || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Resolve either the legacy therapists/profile id or the newer therapist_profiles id.
    let therapist: {
      id: string;
      profileId: string | null;
      display_name: string | null;
      contact_email: string | null;
      user_id: string | null;
    } | null = null;

    const { data: profileMatch, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, full_name, email_address, email')
      .eq('id', therapistId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { message: profileError.message },
        { status: 500 }
      );
    }

    if (profileMatch) {
      therapist = {
        id: profileMatch.id,
        profileId: profileMatch.id,
        display_name: profileMatch.display_name || profileMatch.full_name,
        contact_email: profileMatch.email_address || profileMatch.email,
        user_id: profileMatch.user_id,
      };
    }

    if (!therapist) {
      const { data: therapistProfile, error: therapistProfileError } = await supabase
        .from('therapist_profiles')
        .select('id, profile_id, user_id, display_name, contact_email')
        .eq('id', therapistId)
        .maybeSingle();

      if (therapistProfileError) {
        return NextResponse.json(
          { message: therapistProfileError.message },
          { status: 500 }
        );
      }

      if (therapistProfile) {
        therapist = {
          id: therapistProfile.id,
          profileId: therapistProfile.profile_id,
          display_name: therapistProfile.display_name,
          contact_email: therapistProfile.contact_email,
          user_id: therapistProfile.user_id,
        };
      }
    }

    if (!therapist) {
      return NextResponse.json(
        { message: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Check contact preferences
    let prefsQuery = supabase
      .from('contact_preferences')
      .select('allow_phone, allow_email, allow_whatsapp, auto_reply_message')
      .eq('therapist_id', therapist.id);
    if (therapist.profileId) {
      prefsQuery = prefsQuery.or(`profile_id.eq.${therapist.profileId},therapist_id.eq.${therapist.id}`);
    }
    const { data: prefs } = await prefsQuery.maybeSingle();

    // Validate preferred contact method is allowed
    if (prefs) {
      if (preferredContact === 'phone' && !prefs.allow_phone) {
        return NextResponse.json(
          { message: 'Phone contact is not available for this therapist' },
          { status: 400 }
        );
      }
      if (preferredContact === 'email' && !prefs.allow_email) {
        return NextResponse.json(
          { message: 'Email contact is not available for this therapist' },
          { status: 400 }
        );
      }
      if (preferredContact === 'whatsapp' && !prefs.allow_whatsapp) {
        return NextResponse.json(
          { message: 'WhatsApp contact is not available for this therapist' },
          { status: 400 }
        );
      }
    }

    // Insert inquiry
    const { data: inquiry, error: insertError } = await supabase
      .from('contact_inquiries')
      .insert([
        {
          therapist_id: therapistId,
          profile_id: therapist.profileId,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          message,
          preferred_contact: preferredContact,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { message: 'Failed to send inquiry' },
        { status: 500 }
      );
    }

    // Send notification email to therapist
    try {
      if (therapist.contact_email) await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: therapist.contact_email,
          template: 'new-inquiry',
          data: {
            therapistName: therapist.display_name,
            clientName,
            clientEmail,
            clientPhone: clientPhone || 'Not provided',
            message,
            preferredContact,
            inquiryLink: `${process.env.NEXT_PUBLIC_APP_URL}/pro/inquiries/${inquiry.id}`,
          },
        }),
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: 'Inquiry sent successfully',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
