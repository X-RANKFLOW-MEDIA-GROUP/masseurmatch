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

    if (!therapistId || !clientName || !clientEmail || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    let therapist: {
      id: string;
      profileId: string | null;
      displayName: string | null;
      contactEmail: string | null;
      userId: string | null;
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
        displayName: profileMatch.display_name || profileMatch.full_name,
        contactEmail: profileMatch.email_address || profileMatch.email,
        userId: profileMatch.user_id,
      };
    }

    if (!therapist) {
      const { data: therapistProfile, error: therapistProfileError } = await supabase
        .from('therapist_profiles')
        .select('id, profile_id, user_id')
        .eq('id', therapistId)
        .maybeSingle();

      if (therapistProfileError) {
        return NextResponse.json(
          { message: therapistProfileError.message },
          { status: 500 }
        );
      }

      if (therapistProfile?.profile_id) {
        const { data: linkedProfile, error: linkedProfileError } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, full_name, email_address, email')
          .eq('id', therapistProfile.profile_id)
          .maybeSingle();

        if (linkedProfileError) {
          return NextResponse.json(
            { message: linkedProfileError.message },
            { status: 500 }
          );
        }

        if (linkedProfile) {
          therapist = {
            id: therapistProfile.id,
            profileId: linkedProfile.id,
            displayName: linkedProfile.display_name || linkedProfile.full_name,
            contactEmail: linkedProfile.email_address || linkedProfile.email,
            userId: therapistProfile.user_id || linkedProfile.user_id,
          };
        }
      }
    }

    if (!therapist) {
      return NextResponse.json(
        { message: 'Therapist not found' },
        { status: 404 }
      );
    }

    let prefsQuery = supabase
      .from('contact_preferences')
      .select('allow_phone, allow_email, allow_whatsapp, auto_reply_message')
      .eq('therapist_id', therapist.id);
    if (therapist.profileId) {
      prefsQuery = prefsQuery.or(`profile_id.eq.${therapist.profileId},therapist_id.eq.${therapist.id}`);
    }
    const { data: prefs } = await prefsQuery.maybeSingle();

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

    try {
      if (therapist.contactEmail) await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: therapist.contactEmail,
          template: 'new-inquiry',
          data: {
            therapistName: therapist.displayName,
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
