import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server';

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

    const supabase = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, full_name, email_address, email')
      .eq('id', therapistId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ message: profileError.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ message: 'Therapist not found' }, { status: 404 });
    }

    const { data: prefs } = await supabase
      .from('contact_preferences')
      .select('allow_phone, allow_email, allow_whatsapp, auto_reply_message')
      .eq('therapist_id', profile.id)
      .maybeSingle();

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
          profile_id: profile.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          message,
          preferred_contact: preferredContact ?? 'email',
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

    const therapistEmail = profile.email_address || profile.email;
    if (therapistEmail) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${appUrl}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: therapistEmail,
            template: 'new-inquiry',
            data: {
              therapistName: profile.display_name || profile.full_name,
              clientName,
              clientEmail,
              clientPhone: clientPhone || 'Not provided',
              message,
              preferredContact,
              inquiryLink: `${appUrl}/pro/inquiries/${inquiry.id}`,
            },
          }),
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    return NextResponse.json(
      { message: 'Inquiry sent successfully', inquiryId: inquiry.id },
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
