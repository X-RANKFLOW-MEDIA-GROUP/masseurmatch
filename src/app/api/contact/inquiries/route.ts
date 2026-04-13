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

    // Check if therapist exists
    const { data: therapist, error: therapistError } = await supabase
      .from('therapists')
      .select('id, display_name, contact_email, user_id')
      .eq('id', therapistId)
      .single();

    if (therapistError || !therapist) {
      return NextResponse.json(
        { message: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Check contact preferences
    const { data: prefs } = await supabase
      .from('contact_preferences')
      .select('allow_phone, allow_email, allow_whatsapp, auto_reply_message')
      .eq('therapist_id', therapistId)
      .single();

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
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
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
